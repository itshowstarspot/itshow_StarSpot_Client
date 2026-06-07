import { useEffect } from 'react'
import styled from 'styled-components'
import { Shell, Header, Title, LinkBtn, Empty, Arrow } from './SectionShell'
import { useCourse } from '../../hooks/useCourse'

const Row = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  border-bottom: 1px solid rgba(45,47,54,0.05);
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(232,214,100,0.05); }
`

const CourseTitle = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #2d2f36;
  margin: 0 0 2px;
`

const CourseCount = styled.p`
  font-size: 11px;
  color: rgba(45,47,54,0.4);
  margin: 0;
`

export default function MyCoursesSection({ onCourseClick, onCreateClick }) {
  const { courses, loadCourses } = useCourse()

  useEffect(() => { loadCourses() }, [loadCourses])

  return (
    <Shell>
      <Header>
        <Title>🗒️ 내 코스</Title>
        <LinkBtn onClick={onCreateClick}>코스 만들기</LinkBtn>
      </Header>
      {courses.length === 0
        ? <Empty>저장된 코스가 없어요.</Empty>
        : courses.map((course) => (
            <Row key={course.id} onClick={() => onCourseClick?.(course)}>
              <div>
                <CourseTitle>{course.title}</CourseTitle>
                <CourseCount>장소 {course.places?.length ?? 0}개</CourseCount>
              </div>
              <Arrow>›</Arrow>
            </Row>
          ))
      }
    </Shell>
  )
}
