import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, IconButton, TextField, Typography } from '@mui/material';

// MUI Icons.
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Components.
import Alert from '../Alert/Alert';
import Spinner from '../Spinner/Spinner';

// Functions.
import { updateUser } from '../../features/auth/authSlice';

const SettingsModal = () => {
  const authLoading = useSelector((state) => state.authReducer.loading);
  const authUser = useSelector((state) => state.authReducer.user);
  const authUserId = useSelector((state) => state.authReducer.user._id);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // STATE.
  const [picture, setPicture] = useState('');
  const [pictureLoading, setPictureLoading] = useState(false);
  const [picturePreview, setPicturePreview] = useState('');
  const [uploadPictureAlert, setUploadPictureAlert] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameInputError, setUsernameInputError] = useState(false);
  const [usernameInputHelperText, setUsernameInputHelperText] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!authLoading) { 
      getInitialValues();
    }
  }, [authLoading, authUser]);

  // Set initial values.
  const getInitialValues = () => {
    try {
      setPicture(authUser.avatar); 
      setPicturePreview(authUser.avatar);
      setUsername(authUser.username);
      setUsernameInputError(false);
      setUsernameInputHelperText('');
    } catch (err) {
      console.error(err);
    }
  };

  // 'Close' function for 'Alert' Component.
  const handleCloseUploadPictureAlert = (event, reason) => {
    try {
      if (reason === 'clickaway') {
        return;
      }

      setUploadPictureAlert(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Select user's new avatar.
  const selectAvatar = (picture) => {
    try {
      setPictureLoading(true);

      if (picture === undefined) {
        setPictureLoading(false);
        return;
      }

      if (picture.type === 'image/png' || picture.type === 'image/jpeg' || picture.type === 'image/gif') {
        const formData = new FormData();
        formData.append('file', picture);
        formData.append('upload_preset', 'chitchat');
        formData.append('cloud_name', 'doaivcqt6');

        fetch(`https://api.cloudinary.com/v1_1/doaivcqt6/image/upload`, {
          method: 'POST',
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            const url = data.url.toString();
            console.log('PICTURE_URL: ', url);
            setPicture(url);
            setPicturePreview(url);
            setPictureLoading(false);
          })
          .catch((err) => {
            console.error(err);
            setPictureLoading(false);
          });
      } else {
        setUploadPictureAlert(true);

        // Reset input vale for 'select' field.
        fileInputRef.current.value = null;

        setTimeout(() => {
          setUploadPictureAlert(false);
        }, 5000);

        setPictureLoading(false);

        return;
      }
    } catch (err) {
      console.error(err);
      setPictureLoading(false);
    }
  };

  // Update user's profile.
  const handleSubmit = async (event) => {
    try {
      event.preventDefault();

      // If no picture URL (either existing or newly uploaded) - then enable ALERT.
      if (!picture || typeof picture !== 'string' || picture.trim() === '') {
        setUploadPictureAlert(true);

        setTimeout(() => {
          setUploadPictureAlert(false);
        }, 5000);

        return;
      }

      if (!username || username === '') {
        setUsernameInputError(true);
        setUsernameInputHelperText('Please enter something.');
        return;
      }

      const id = authUserId;

      dispatch(updateUser({ id, picture, username }));
      navigate('/chat');
    } catch (err) {
      console.error(err);
    }
  };

  // Reset form values.
  const resetForm = async (event) => {
    try {
      event.preventDefault();

      getInitialValues();

      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {authLoading ? (
        <Box
          component='div'
          sx={{
            alignItems: 'center',
            display: 'flex',
            height: '100vh',
            justifyContent: 'center',
            width: '100vw',
          }}
        >
          <Spinner />
        </Box>
      ) : (
        <Box
          component='form'
          autoComplete='off'
          noValidate
          sx={{
            alignItems: 'center',
            backgroundColor: 'rgb(93, 109, 126)',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            justifyContent: 'center',
            width: '100vw',
          }}
          onSubmit={handleSubmit}
        >
          <Box
            sx={{
              alignItems: 'center',
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              padding: '1rem',
              width: '50rem',
            }}
          >
            <IconButton
              aria-label='go back'
              sx={{
                alignSelf: 'flex-start',
                display: 'flex',
                margin: '0.5rem 1rem',
              }}
              onClick={() => navigate('/chat')}
            >
              <ArrowBackIcon sx={{ fontSize: '3rem' }} />
            </IconButton>

            <Typography
              component='div'
              sx={{
                fontSize: '3rem',
                fontFamily: 'Roboto',
              }}
            >
              Update Profile
            </Typography>

            <FormControl>
              {uploadPictureAlert && (
                <Box component='div' sx={{ marginBottom: '1rem' }}>
                  <Alert
                    handleFunction={handleCloseUploadPictureAlert}
                    severityType={'warning'}
                    message={'Please select an image.'}
                  />
                </Box>
              )}

              <Box
                component='img'
                src={picturePreview}
                alt='avatar'
                draggable='false'
                sx={{
                  alignSelf: 'center',
                  borderRadius: '50%',
                  height: '10rem',
                  margin: '2rem 0rem',
                  width: '10rem',
                }}
              />

              <FormLabel
                sx={{
                  color: 'black',
                  fontSize: '1.6rem',
                  marginBottom: '1rem',
                }}
              >
                Upload your avatar:
              </FormLabel>

              <TextField
                inputRef={fileInputRef}
                type='file'
                slotProps={{
                  htmlInput: { accept: 'image/png, image/jpeg, image/gif' },
                }}
                sx={{ marginBottom: '2rem' }}
                onChange={(event) => {
                  selectAvatar(event.target.files[0]);
                }}
              />

              <TextField
                error={usernameInputError}
                helperText={usernameInputHelperText}
                label='Username...'
                variant='outlined'
                slotProps={{
                  inputLabel: { sx: { fontSize: '1.4rem' } },
                }}
                sx={{
                  marginBottom: '2rem',
                  width: '100%',
                  '.MuiOutlinedInput-notchedOutline': { fontSize: '1.4rem' },
                  '.MuiInputBase-input': { fontSize: '1.4rem' },
                  '.MuiFormHelperText-contained': { fontSize: '1.2rem' },
                }}
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                }}
              />
            </FormControl>

            <Box display='flex'>
              <Button
                type='submit'
                variant='outlined'
                sx={{
                  borderColor: 'lightgray',
                  color: 'black',
                  fontSize: '1.4rem',
                  fontWeight: '400',
                  margin: '2rem 0.5rem 2rem',
                  padding: '0.5rem 2rem',
                  textTransform: 'none',
                  ':hover': { backgroundColor: 'rgb(10, 199, 20)', color: 'white' },
                }}
                loading={pictureLoading}
              >
                Save
              </Button>

              <Button
                type='button'
                variant='outlined'
                sx={{
                  borderColor: 'lightgray',
                  color: 'black',
                  fontSize: '1.4rem',
                  fontWeight: '400',
                  margin: '2rem 0.5rem 2rem',
                  padding: '0.5rem 2rem',
                  textTransform: 'none',
                  ':hover': { backgroundColor: 'rgb(231, 34, 34)', color: 'white' },
                }}
                onClick={resetForm}
              >
                Reset
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default SettingsModal;
