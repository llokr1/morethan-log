import styled from "@emotion/styled"
import { useRouter } from "next/router"
import React from "react"
import { Emoji } from "src/components/Emoji"
import { DEFAULT_CATEGORY } from "src/constants"
import { useCategoriesQuery } from "src/hooks/useCategoriesQuery"

const CategoryList: React.FC = () => {
  const router = useRouter()
  const currentCategory = `${router.query.category || ""}` || undefined
  const data = useCategoriesQuery()

  const handleClickCategory = (value: string) => {
    const isAll = value === DEFAULT_CATEGORY
    const isActive = currentCategory === value

    router.push({
      query: {
        ...router.query,
        category: isAll || isActive ? undefined : value,
      },
    })
  }

  return (
    <StyledWrapper>
      <div className="top">
        <Emoji>📂</Emoji> Categories
      </div>
      <div className="list">
        {Object.keys(data).map((key) => (
          <a
            key={key}
            data-active={
              key === currentCategory ||
              (key === DEFAULT_CATEGORY && !currentCategory)
            }
            onClick={() => handleClickCategory(key)}
          >
            {key}
            <span className="count">{data[key]}</span>
          </a>
        ))}
      </div>
    </StyledWrapper>
  )
}

export default CategoryList

const StyledWrapper = styled.div`
  margin-bottom: 1.5rem;

  .top {
    display: none;
    padding: 0.25rem;
    margin-bottom: 0.75rem;

    @media (min-width: 1024px) {
      display: block;
    }
  }

  .list {
    display: flex;
    gap: 0.25rem;
    overflow: scroll;

    scrollbar-width: none;
    -ms-overflow-style: none;
    ::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    @media (min-width: 1024px) {
      display: block;
    }

    a {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.25rem;
      padding-left: 1rem;
      padding-right: 1rem;
      margin-top: 0.25rem;
      margin-bottom: 0.25rem;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: ${({ theme }) => theme.colors.gray10};
      flex-shrink: 0;
      cursor: pointer;

      :hover {
        background-color: ${({ theme }) => theme.colors.gray4};
      }
      &[data-active="true"] {
        color: ${({ theme }) => theme.colors.gray12};
        background-color: ${({ theme }) => theme.colors.gray4};

        :hover {
          background-color: ${({ theme }) => theme.colors.gray4};
        }
      }

      .count {
        font-size: 0.75rem;
        color: ${({ theme }) => theme.colors.gray9};
        margin-left: 0.5rem;

        @media (max-width: 1023px) {
          display: none;
        }
      }
    }
  }
`
