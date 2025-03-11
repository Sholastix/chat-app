import { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
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

const SettingsModal = () => {
	// This hook accepts a selector function as its parameter. Function receives Redux STATE as argument.
	const authState = useSelector((state) => {
		return state.authReducer
	});

	// This constant will be used to dispatch ACTIONS when we need it.
	const dispatch = useDispatch();

	const [picture, setPicture] = useState('');
	const [pictureLoading, setPictureLoading] = useState(false);

	// STATE for 'Alert' Component.
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
						console.log('DATA: ', data.url.toString());
						setPictureLoading(false);
					})
			} else {
				console.log('Wrong picture format.')
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

			const user = await axios.put(`/api/user/${id}`, {
				picture: picture
			});

			console.log('UPDATED_USER: ', user);

			setPicture('');
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
									fontFamily: 'Roboto',
									marginBottom: '3rem',
									textAlign: 'center'
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
										sx={{
											marginBottom: '1rem'
										}}
									>
										<Alert
											handleFunction={handleCloseUploadPictureAlert}
											severityType={'warning'}
											message={'Please select an image.'}
										/>
									</Box>
								}

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
								onClick={handleSubmit}
							>
								Submit
							</Button>
						</Box>
					</Box>
			}
		</Fragment>
	);
};

export default SettingsModal;