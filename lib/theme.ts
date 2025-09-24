export const theme = {
  brandInfo: {
    name: "숨고 (Soomgo)",
    tagline: "더 나은 일상을 위한 생활의 기술",
    description: "숨은고수를 찾아 다양한 생활 서비스를 연결하는 플랫폼",
    logoAlt: "숨고, 숨은고수"
  },
  colors: {
    primary: {
      main: "#693BF2",
      hover: "#5A2FD9",
    },
    secondary: {
      light: "#F1EEFF",
      medium: "#E3DEFF",
    },
    neutral: {
      darkest: "#293341",
      dark: "#1C242F",
      medium: "#6A7685",
      light: "#C7CED6",
      lightest: "#EFF1F5",
      background: "#F6F7F9",
    },
    white: "#FFFFFF",
    accent: {
      red: "#EA1623",
      blue: "#103580",
    },
    opacity: {
      overlay15: "rgba(0, 0, 0, 0.15)",
      overlay30: "rgba(0, 0, 0, 0.3)"
    }
  },
  typography: {
    fontFamily: {
      primary: "Pretendard",
      fallback: '"Malgun Gothic", -apple-system, "Segoe UI", Roboto, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
    },
    headings: {
      h1: {
        fontSize: "40px",
        fontWeight: "400",
        lineHeight: "60px",
        color: "#293341",
      },
      h2: {
        fontSize: "28px",
        fontWeight: "700",
        lineHeight: "48px",
        color: "#293341",
      },
      h3: {
        fontSize: "14px",
        fontWeight: "500",
        lineHeight: "20px",
        color: "#FFFFFF",
      },
      h4: {
        fontSize: "16px",
        fontWeight: "500",
        lineHeight: "25.12px",
        color: "#293341",
      }
    },
    body: {
      fontSize: "16px",
      fontWeight: "400",
      lineHeight: "24px",
      color: "#293341"
    },
    small: {
      fontSize: "14px",
    }
  },
  spacing: {
    container: {
      maxWidth: "1200px",
      padding: "0 16px",
      margin: "0 auto"
    },
    sections: {
      marginBottom: "60px",
      paddingVertical: "40px"
    },
    cards: {
      padding: "12px 0px",
      margin: "0px",
      gap: "16px"
    },
    grid: {
      gap: "3px",
      columnGap: "16px",
      rowGap: "12px"
    }
  },
  components: {
    buttons: {
      primary: {
        backgroundColor: "#693BF2",
        color: "#FFFFFF",
        padding: "12px 24px",
        borderRadius: "8px",
        border: "none",
        fontSize: "16px",
        fontWeight: "500",
        cursor: "pointer",
        hover: {
          backgroundColor: "#5A2FD9"
        }
      },
      secondary: {
        backgroundColor: "transparent",
        color: "#293341",
        padding: "8px 16px",
        border: "1px solid #E0E5EB",
        borderRadius: "6px",
        fontSize: "14px"
      },
      ghost: {
        backgroundColor: "transparent",
        color: "#693BF2",
        padding: "8px 12px",
        border: "none",
        fontSize: "14px"
      }
    },
    searchInput: {
      backgroundColor: "#EFF1F5",
      border: "none",
      borderRadius: "8px",
      padding: "12px 16px",
      fontSize: "14px",
      height: "44px",
      width: "100%",
      placeholder: {
        color: "#6A7685"
      }
    },
    cards: {
      default: {
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid #EFF1F5",
        padding: "16px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        hover: {
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
          transform: "translateY(-2px)"
        }
      },
      service: {
        backgroundColor: "#FFFFFF",
        borderRadius: "8px",
        padding: "12px",
        textAlign: "center",
        border: "1px solid #EFF1F5"
      },
      portfolio: {
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)"
      }
    },
    navigation: {
      height: "64px",
      backgroundColor: "#FFFFFF",
      borderBottom: "1px solid #EFF1F5",
      padding: "0 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    },
    badges: {
      rating: {
        backgroundColor: "#693BF2",
        color: "#FFFFFF",
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "600"
      },
      category: {
        backgroundColor: "#F1EEFF",
        color: "#693BF2",
        padding: "4px 12px",
        borderRadius: "16px",
        fontSize: "12px"
      }
    }
  },
  layout: {
    breakpoints: {
      mobile: "375px",
      tablet: "768px",
      desktop: "1200px"
    },
    grid: {
      columns: 12,
      gutter: "16px",
      maxWidth: "1200px"
    }
  },
  responsive: {
    mobile: {
      fontSize: "14px",
      padding: "12px",
      gridColumns: "repeat(2, 1fr)",
      touchTarget: "44px",
      containerPadding: "12px",
      sectionPadding: "20px"
    },
    tablet: {
      fontSize: "16px",
      padding: "16px",
      gridColumns: "repeat(3, 1fr)",
      touchTarget: "44px",
      containerPadding: "16px",
      sectionPadding: "32px"
    },
    desktop: {
      fontSize: "16px",
      padding: "20px",
      gridColumns: "repeat(6, 1fr)",
      touchTarget: "44px",
      containerPadding: "20px",
      sectionPadding: "40px"
    },
    touchOptimization: {
      minTouchTarget: "44px",
      tapHighlight: "transparent",
      userSelect: "none"
    }
  },
  interactions: {
    hover: {
      cards: {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
        transition: "all 0.2s ease"
      }
    }
  }
} as const;

export type Theme = typeof theme;