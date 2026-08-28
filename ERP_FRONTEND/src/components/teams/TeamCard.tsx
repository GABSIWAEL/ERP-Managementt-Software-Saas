import { Team } from '@types'
import { Card, CardContent, Badge, Button } from '@components/ui'
import { Users, Edit2, Trash2, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface TeamCardProps {
  team: Team
  onEdit?: (team: Team) => void
  onDelete?: (team: Team) => void
  onManageMembers?: (team: Team) => void
}

export default function TeamCard({ team, onEdit, onDelete, onManageMembers }: TeamCardProps) {
  const navigate = useNavigate()

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    navigate(`/teams/${team.id}`)
  }

  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={handleCardClick}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 flex items-center gap-2">
                {team.name}
                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {team.departmentName || 'N/A'}
              </p>
            </div>
          </div>

          {/* Description */}
          {team.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {team.description}
            </p>
          )}

          {/* Manager & Members Info */}
          <div className="flex items-center gap-4 py-2 border-t border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manager</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {team.managerName || 'Unassigned'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Users size={16} className="text-primary-600 dark:text-primary-400" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {team.memberCount || 0} members
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {onManageMembers && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onManageMembers(team)
                }}
                className="flex-1"
              >
                <Users size={14} className="mr-1" />
                Members
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(team)
                }}
                className="flex-1"
              >
                <Edit2 size={14} className="mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(team)
                }}
                className="flex-1"
              >
                <Trash2 size={14} className="mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

