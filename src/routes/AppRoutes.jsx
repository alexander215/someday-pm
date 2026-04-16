import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import CardDetailPage from '../pages/CardDetailPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/card/:cardId" element={<CardDetailPage />} />
    </Routes>
  )
}
