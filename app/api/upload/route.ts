import { NextRequest, NextResponse } from 'next/server'
import formidable from 'formidable'
import { promises as fs } from 'fs'
import path from 'path'

// Formidable configuration
const form = formidable({
  maxFileSize: 5 * 1024 * 1024, // 5MB limit
  keepExtensions: true,
  allowEmptyFiles: false,
})

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

// Helper function to validate file
function validateFile(file: formidable.File): { valid: boolean; error?: string } {
  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: '파일 크기는 5MB 이하로 업로드해주세요.' }
  }

  // Check file type
  if (file.mimetype && !ALLOWED_TYPES.includes(file.mimetype)) {
    return { valid: false, error: 'JPG, PNG, WebP 파일만 업로드 가능합니다.' }
  }

  // Check file extension
  const ext = path.extname(file.originalFilename || '').toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: 'JPG, PNG, WebP 파일만 업로드 가능합니다.' }
  }

  return { valid: true }
}

// Generate unique filename
function generateFileName(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = path.extname(originalName)
  return `${userId}-${timestamp}-${random}${extension}`
}

// Convert NextRequest to Node.js request for formidable
async function parseFormData(request: NextRequest) {
  const data = await request.formData()
  const file = data.get('file') as File
  const userId = data.get('userId') as string
  const category = data.get('category') as string || 'posts'

  if (!file) {
    throw new Error('No file provided')
  }

  if (!userId) {
    throw new Error('No userId provided')
  }

  // Convert File to formidable.File-like object
  const buffer = Buffer.from(await file.arrayBuffer())
  const tempFile = {
    filepath: '',
    originalFilename: file.name,
    mimetype: file.type,
    size: file.size,
    buffer
  }

  return { file: tempFile, userId, category }
}

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const { file, userId, category } = await parseFormData(request)

    // Validate file
    const validation = validateFile(file as any)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileName = generateFileName(file.originalFilename || 'upload', userId)

    // Create upload directory path
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', category)
    await fs.mkdir(uploadDir, { recursive: true })

    // Save file
    const filePath = path.join(uploadDir, fileName)
    await fs.writeFile(filePath, file.buffer)

    // Return success response with URL
    const fileUrl = `/uploads/${category}/${fileName}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
      originalName: file.originalFilename,
      size: file.size,
      type: file.mimetype
    })

  } catch (error) {
    console.error('Image upload error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.'
      },
      { status: 500 }
    )
  }
}

// Handle GET request to list uploaded files (optional)
export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const files = await fs.readdir(uploadsDir, { recursive: true })

    return NextResponse.json({
      success: true,
      files: files.filter(file => typeof file === 'string' && file !== '.gitkeep')
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '파일 목록을 가져올 수 없습니다.' },
      { status: 500 }
    )
  }
}

// Handle DELETE request to remove uploaded files
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileUrl = searchParams.get('url')

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: '삭제할 파일 URL이 필요합니다.' },
        { status: 400 }
      )
    }

    // Extract file path from URL (remove leading /uploads/)
    const relativePath = fileUrl.replace(/^\/uploads\//, '')
    const filePath = path.join(process.cwd(), 'public', 'uploads', relativePath)

    // Check if file exists
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json(
        { success: false, error: '파일을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Delete file
    await fs.unlink(filePath)

    return NextResponse.json({
      success: true,
      message: '파일이 성공적으로 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Image delete error:', error)

    return NextResponse.json(
      {
        success: false,
        error: '이미지 삭제에 실패했습니다.'
      },
      { status: 500 }
    )
  }
}