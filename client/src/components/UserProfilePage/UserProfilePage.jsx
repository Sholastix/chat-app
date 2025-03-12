import { useState, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  TextField,
  Typography
} from '@mui/material';

// Components.
import Alert from '../Alert/Alert';
import Spinner from '../Spinner/Spinner'

// Environment variables.
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

// Functions.
import { updateUser } from '../../features/auth/authSlice';

const SettingsModal = () => {
  const authState = useSelector((state) => {
    return state.authReducer
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [picture, setPicture] = useState('');
  const [pictureLoading, setPictureLoading] = useState(false);
  const [picturePreview, setPicturePreview] = useState(authState.user.avatar);
  const [uploadPictureAlert, setUploadPictureAlert] = useState(false);

  // 'Close' function for 'Alert' Component.
  const handleCloseUploadPictureAlert = (event, reason) => {
    try {
      if (reason === 'clickaway') {
        return;
      };

      setUploadPictureAlert(false);
    } catch (err) {
      console.error(err);
    };
  };

  // Select user's new avatar.
  const selectAvatar = (picture) => {
    try {
      setPictureLoading(true);

      if (picture === undefined) {
        setPictureLoading(false);
        return;
      };

      if (picture.type === 'image/png' || picture.type === 'image/jpeg' || picture.type === 'image/gif') {
        const formData = new FormData();
        formData.append('file', picture);
        formData.append('upload_preset', 'chitchat');
        formData.append("cloud_name", cloudName);

        fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'post',
          body: formData
        })
          .then((res) => res.json())
          .then((data) => {
            setPicture(data.url.toString());
            setPicturePreview(data.url.toString());
            console.log('DATA: ', data.url.toString());
            setPictureLoading(false);
          })
      } else {
        setUploadPictureAlert(true);

        setTimeout(() => {
          setUploadPictureAlert(false);
        }, 5000);

        setPictureLoading(false);

        return;
      };
    } catch (err) {
      console.error(err);
    };
  };

  // Update user's profile.
  const handleSubmit = async (event) => {
    try {
      event.preventDefault();

      if (picture === '') {
        setUploadPictureAlert(true);

        setTimeout(() => {
          setUploadPictureAlert(false);
        }, 5000);

        return;
      };

      const id = authState.user._id;

      dispatch(updateUser({ id, picture }));

      navigate('/chat');
    } catch (err) {
      console.error(err);
    };
  };

  return (
    <Fragment>
      {
        authState.loading
          ?
          <Box
            component='div'
            sx={{
              alignItems: 'center',
              display: 'flex',
              height: '100vh',
              justifyContent: 'center',
              width: '100vw'
            }}
          >
            <Spinner />
          </Box>
          :
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
              width: '100vw'
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
                padding: '3rem',
                width: '50rem'
              }}
            >
              <Typography
                component='div'
                sx={{
                  fontSize: '3rem',
                  fontFamily: 'Roboto'
                }}
              >
                Update Profile
              </Typography>

              <FormControl>
                {
                  uploadPictureAlert
                  &&
                  <Box
                    component='div'
                    sx={{ marginBottom: '1rem' }}
                  >
                    <Alert
                      handleFunction={handleCloseUploadPictureAlert}
                      severityType={'warning'}
                      message={'Please select an image.'}
                    />
                  </Box>
                }

                <Box
                  component='img'
                  src={picturePreview}
                  alt='avatar'
                  sx={{
                    alignSelf: 'center',
                    borderRadius: '50%',
                    height: '10rem',
                    margin: '1rem 0rem',
                    width: '10rem'
                  }}
                />

                <FormLabel
                  sx={{
                    color: 'black',
                    fontSize: '1.6rem',
                    marginBottom: '1rem'
                  }}
                >
                  Upload your avatar:
                </FormLabel>

                <TextField
                  type='file'
                  slotProps={{
                    htmlInput: { accept: 'image/png, image/jpeg, image/gif' }
                  }}
                  sx={{
                    color: 'black',
                    fontSize: '1.4rem',
                    marginBottom: '1rem'
                  }}
                  onChange={(event) => { selectAvatar(event.target.files[0]) }}
                />
              </FormControl>

              <Button
                type='submit'
                variant='outlined'
                sx={{
                  borderColor: 'lightgray',
                  color: 'black',
                  fontSize: '1.4rem',
                  fontWeight: '400',
                  marginTop: '2rem',
                  padding: '0.5rem 2rem',
                  textTransform: 'none',
                  ':hover': { backgroundColor: 'rgb(235, 235, 235)', color: 'black' }
                }}
                loading={pictureLoading}
              >
                Save
              </Button>
            </Box>
          </Box>
      }
    </Fragment>
  );
};

export default SettingsModal;