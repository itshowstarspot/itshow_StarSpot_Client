import styled from 'styled-components'

export const Shell = styled.div`
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
  border-bottom: 1px solid rgba(45,47,54,0.06);
`

export const Title = styled.h2`
  font-size: 14px;
  font-weight: 700;
  color: #2d2f36;
  margin: 0;
`

export const LinkBtn = styled.button`
  font-size: 12px;
  color: rgba(45,47,54,0.4);
  background: none;
  border: none;
  cursor: pointer;
  &:hover { color: #e8d664; }
`

export const Empty = styled.p`
  font-size: 13px;
  color: rgba(45,47,54,0.35);
  text-align: center;
  padding: 20px 0;
  margin: 0;
`

export const NavRow = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  border-bottom: 1px solid rgba(45,47,54,0.05);
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(232,214,100,0.05); }
`

export const NavLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #2d2f36;
  display: flex;
  align-items: center;
  gap: 10px;
`

export const Arrow = styled.span`
  font-size: 16px;
  color: rgba(45,47,54,0.25);
`
