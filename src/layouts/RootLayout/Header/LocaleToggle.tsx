import styled from "@emotion/styled"
import { useRouter } from "next/router"

const LocaleToggle: React.FC = () => {
  const router = useRouter()
  const currentLocale = router.locale || "ko"

  const handleToggle = () => {
    const nextLocale = currentLocale === "ko" ? "en" : "ko"
    router.push(router.asPath, router.asPath, { locale: nextLocale })
  }

  return (
    <StyledWrapper onClick={handleToggle} aria-label="언어 전환">
      <span data-active={currentLocale === "ko"}>KO</span>
      <span className="divider">/</span>
      <span data-active={currentLocale === "en"}>EN</span>
    </StyledWrapper>
  )
}

export default LocaleToggle

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray9};

  span[data-active="true"] {
    color: ${({ theme }) => theme.colors.gray12};
    font-weight: 700;
  }

  .divider {
    color: ${({ theme }) => theme.colors.gray7};
    font-weight: 400;
  }

  &:hover span[data-active="false"] {
    color: ${({ theme }) => theme.colors.gray11};
  }
`
