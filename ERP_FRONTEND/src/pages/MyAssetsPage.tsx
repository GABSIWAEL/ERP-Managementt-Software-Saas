import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, Button, Badge, DataTable } from '@components/ui'
import { MainLayout } from '@components/layout'
import { assetApi } from '@api/index'
import { Asset, AssetStatus, type User } from '@types'
import { formatDate, formatCurrency } from '@utils/helpers'
import { useAuthStore } from '@store/authStore'
import { Package, AlertCircle } from 'lucide-react'

export default function MyAssetsPage() {
  const user = useAuthStore((state) => state.user)
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch assigned assets for the current employee profile
  const employeeId = user?.employeeId ?? user?.id

  const { data: assetsData = { content: [] }, isLoading, error } = useQuery({
    queryKey: ['my-assets', page, employeeId],
    queryFn: async () => {
      if (!employeeId) return { content: [], totalElements: 0, totalPages: 0 }
      const response = await assetApi.getByEmployee(employeeId, page, 100)
      const content = Array.isArray(response) ? response : response.content || []
      return {
        content,
        totalElements: response.totalElements ?? content.length,
        totalPages: response.totalPages ?? 1
      }
    },
    enabled: !!employeeId,
  })

  const assets = Array.isArray(assetsData) ? assetsData : assetsData.content || []

  const filteredAssets = assets.filter((asset: Asset) =>
    asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.assetCode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      [AssetStatus.AVAILABLE]: 'bg-green-100 text-green-800',
      [AssetStatus.ASSIGNED]: 'bg-blue-100 text-blue-800',
      [AssetStatus.RETURNED]: 'bg-gray-100 text-gray-800',
      [AssetStatus.DAMAGED]: 'bg-red-100 text-red-800',
      [AssetStatus.SOLD]: 'bg-orange-100 text-orange-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  type ColumnKey = 'name' | 'assetCode' | 'category' | 'purchasePrice' | 'status'
  type Column = {
    key: ColumnKey
    label: string
    render: (value: Asset[ColumnKey]) => ReactNode
  }

  const columns: Column[] = [
    {
      key: 'name',
      label: 'Asset Name',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'assetCode',
      label: 'Asset Code',
      render: (value) => <code className="bg-gray-100 px-2 py-1 rounded text-sm">{value}</code>,
    },
    {
      key: 'category',
      label: 'Category',
      render: (value) => <span className="text-sm text-gray-600">{value || '-'}</span>,
    },
    {
      key: 'purchasePrice',
      label: 'Value',
      render: (value) => <span className="font-semibold">{formatCurrency(value as number || 0)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge className={getStatusColor(value as string)}>
          {value || 'N/A'}
        </Badge>
      ),
    },
  ]

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Assets</h3>
              <p className="text-red-700 text-sm">{error instanceof Error ? error.message : 'Failed to load your assets'}</p>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Package className="text-blue-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Assets</h1>
              <p className="text-gray-600 mt-1">View your assigned assets</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{filteredAssets.length}</div>
            <div className="text-sm text-gray-600">Total Assets</div>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by asset name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600 text-lg">No assets assigned to you</p>
                <p className="text-gray-500 text-sm mt-1">Assets assigned by your administrator will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAssets.map((asset: Asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                        {columns.map((column) => (
                          <td
                            key={`${asset.id}-${column.key}`}
                            className="px-6 py-4 text-sm text-gray-700"
                          >
                            {column.render(asset[column.key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {filteredAssets.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Note:</span> These are the assets currently assigned to you. If you need to report damage, loss, or have any questions about these assets, please contact your administrator.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

