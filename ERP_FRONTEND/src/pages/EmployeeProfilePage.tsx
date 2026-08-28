import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, Button, Input, Select, Modal, Badge } from '@components/ui'
import { MainLayout } from '@components/layout'
import { employeeApi } from '@api/index'
import { Employee } from '@types'
import { formatDate, getFullName } from '@utils/helpers'
import { Edit, Save, User, Mail, Phone, MapPin, Briefcase } from 'lucide-react'

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  dateOfJoining: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function EmployeeProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Fetch current user's profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['employee-profile'],
    queryFn: async () => {
      try {
        const response = await employeeApi.getProfile?.()
        if (!response) {
          throw new Error('Profile endpoint not available')
        }
        return response
      } catch (err) {
        console.error('Profile fetch error:', err)
        setProfileError('Unable to load your profile')
        throw err
      }
    },
    retry: 1,
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      employeeApi.update ? employeeApi.update(profile!.id, data as any) : Promise.reject('Update not available'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-profile'] })
      setIsEditing(false)
    },
    onError: (error) => {
      setProfileError('Failed to update profile. Please try again.')
      console.error('Update error:', error)
    },
  })

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  // Populate form when profile loads
  React.useEffect(() => {
    if (profile) {
      setValue('firstName', profile.firstName || '')
      setValue('lastName', profile.lastName || '')
      setValue('email', profile.email || '')
      setValue('phone', profile.phone || '')
      setValue('address', (profile as any).address || '')
      setValue('city', (profile as any).city || '')
      setValue('position', (profile as any).jobPosition || (profile as any).position || '')
      setValue('department', (profile as any).departmentName || (profile as any).department || '')
      setValue('dateOfJoining', (profile as any).dateOfJoining || '')
    }
  }, [profile, setValue])

  const onUpdate = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading your profile...</div>
        </div>
      </MainLayout>
    )
  }

  if (error || !profile) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300">
              {profileError || 'Unable to load your profile. Please try again later.'}
            </p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage your personal information</p>
          </div>
          <Button
            variant={isEditing ? 'secondary' : 'primary'}
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            {isEditing ? (
              <>
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Edit size={18} />
                <span>Edit Profile</span>
              </>
            )}
          </Button>
        </div>

        {/* Error message */}
        {profileError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300">{profileError}</p>
          </div>
        )}

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            {isEditing ? (
              // Edit Form
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Profile</h2>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onUpdate)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          First Name
                        </label>
                        <Input {...register('firstName')} placeholder="First name" />
                        {errors.firstName && (
                          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Last Name
                        </label>
                        <Input {...register('lastName')} placeholder="Last name" />
                        {errors.lastName && (
                          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <Input {...register('email')} type="email" placeholder="Email" />
                      {errors.email && (
                        <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone
                      </label>
                      <Input {...register('phone')} type="tel" placeholder="Phone number" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Address
                      </label>
                      <Input {...register('address')} placeholder="Street address" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          City
                        </label>
                        <Input {...register('city')} placeholder="City" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={updateProfileMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Save size={18} />
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              // View Mode
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                      <User size={32} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {getFullName(profile.firstName, profile.lastName)}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">Employee ID: {profile.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                        <Mail size={16} /> Email
                      </p>
                      <p className="text-gray-900 dark:text-white font-medium">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                        <Phone size={16} /> Phone
                      </p>
                      <p className="text-gray-900 dark:text-white font-medium">{profile.phone || '-'}</p>
                    </div>
                    {(profile as any).address && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                          <MapPin size={16} /> Address
                        </p>
                        <p className="text-gray-900 dark:text-white font-medium">{(profile as any).address}</p>
                      </div>
                    )}
                    {(profile as any).city && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                          <MapPin size={16} /> City
                        </p>
                        <p className="text-gray-900 dark:text-white font-medium">{(profile as any).city}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Job Information */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase size={20} /> Job Information
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Position</p>
                <p className="text-gray-900 dark:text-white font-medium mt-1">
                  {(profile as any).jobPosition || (profile as any).position || 'N/A'}
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Department</p>
                <p className="text-gray-900 dark:text-white font-medium mt-1">
                  {(profile as any).departmentName || (profile as any).department || 'N/A'}
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date of Joining</p>
                <p className="text-gray-900 dark:text-white font-medium mt-1">
                  {(profile as any).dateOfJoining ? formatDate((profile as any).dateOfJoining) : 'N/A'}
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</p>
                <Badge variant={profile.isActive ? 'success' : 'danger'} className="mt-1">
                  {profile.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

