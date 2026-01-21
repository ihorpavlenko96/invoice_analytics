import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import { useUser } from '@clerk/clerk-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadAvatar } from '../userMutations';
import { fetchUsers } from '../userQueries';
import { userQueryKeys } from '../userQueryKeys';
import { stringAvatar } from '../../../common/utils/avatarUtils';
import { User } from '../types/user';

const UserProfilePage: React.FC = () => {
  const { user: clerkUser } = useUser();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch the user data from our backend
  const { data: users } = useQuery({
    queryKey: userQueryKeys.users(),
    queryFn: () => fetchUsers(),
  });

  const currentUser = users?.find((u: User) => u.email === clerkUser?.emailAddresses[0]?.emailAddress);

  const uploadMutation = useMutation({
    mutationFn: (data: { userId: string; file: File }) => uploadAvatar(data.userId, data.file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.users() });
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to upload avatar');
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and GIF images are allowed');
      return;
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 2MB');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!selectedFile || !currentUser) return;

    uploadMutation.mutate({
      userId: currentUser.id,
      file: selectedFile,
    });
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  if (!currentUser) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const userName = `${currentUser.firstName} ${currentUser.lastName || ''}`.trim();
  const avatarProps = currentUser.avatarUrl
    ? { src: currentUser.avatarUrl }
    : stringAvatar(userName);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Avatar Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Picture
            </Typography>

            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <Avatar
                {...avatarProps}
                sx={{
                  width: 150,
                  height: 150,
                  fontSize: '3rem',
                  ...avatarProps.sx,
                }}
              />

              {previewUrl && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Preview:
                  </Typography>
                  <Avatar
                    src={previewUrl}
                    sx={{
                      width: 150,
                      height: 150,
                      border: '2px solid',
                      borderColor: 'primary.main',
                    }}
                  />
                </Box>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {!selectedFile ? (
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={handleBrowseClick}
                  fullWidth>
                  Choose Image
                </Button>
              ) : (
                <Box display="flex" gap={1} width="100%">
                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    fullWidth>
                    {uploadMutation.isPending ? <CircularProgress size={24} /> : 'Upload'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={uploadMutation.isPending}
                    fullWidth>
                    Cancel
                  </Button>
                </Box>
              )}

              <Typography variant="caption" color="text.secondary" textAlign="center">
                JPG, PNG or GIF. Max size 2MB.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ width: '100%' }}>
                  {error}
                </Alert>
              )}

              {uploadMutation.isSuccess && (
                <Alert severity="success" sx={{ width: '100%' }}>
                  Avatar uploaded successfully!
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* User Info Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Information
            </Typography>

            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      First Name
                    </Typography>
                    <Typography variant="body1">{currentUser.firstName}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Name
                    </Typography>
                    <Typography variant="body1">{currentUser.lastName || '-'}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{currentUser.email}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tenant
                    </Typography>
                    <Typography variant="body1">{currentUser.tenant.name}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Roles
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {currentUser.roles.map((role) => (
                        <Chip key={role.id} label={role.name} color="primary" size="small" />
                      ))}
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Account Status
                    </Typography>
                    <Chip
                      label={currentUser.isActive ? 'Active' : 'Inactive'}
                      color={currentUser.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserProfilePage;
