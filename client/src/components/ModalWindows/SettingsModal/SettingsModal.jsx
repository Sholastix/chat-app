import React from 'react';
import {
	Avatar,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormLabel,
	IconButton,
	Input,
	TextField,
	Typography
} from '@mui/material';

// MUI Icons.
import CloseIcon from '@mui/icons-material/Close';

const SettingsModal = (props) => {
	// Close 'Settings' modal window.
	const handleSettingsModalClose = () => {
		props.setIsSettingsModalOpen(false);
	};

	// Select user's new avatar.
	const selectAvatar = (picture) => {
		//
	};

	// Update user's profile.
	const updateProfile = () => {
		//
	};

	return (
		<Dialog
			open={props.isSettingsModalOpen}
			onClose={handleSettingsModalClose}
			aria-labelledby='modal-user-menu-settings'
		>
			<Box
				sx={{
					backgroundColor: 'white',
					border: 'none',
					borderRadius: '0.5rem',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					left: '50vw',
					padding: '3rem',
					position: 'fixed',
					top: '50vh',
					transform: 'translate(-50%, -50%)',
					width: '50rem',
				}}
			>
				<DialogTitle
					component='div'
					id='modal-user-menu-settings'
					sx={{
						fontSize: '2rem',
						fontFamily: 'Roboto',
						textAlign: 'center'
					}}
				>
					Settings
				</DialogTitle>

				<IconButton
					aria-label='close'
					onClick={handleSettingsModalClose}
					sx={{
						position: 'absolute',
						right: 8,
						top: 8,
					}}
				>
					<CloseIcon sx={{ fontSize: '2rem' }} />
				</IconButton>

				<DialogContent>
					<FormControl>
						<FormLabel
							sx={{
								color: 'black',
								fontSize: '1.4rem',
								marginBottom: '1rem'
							}}
						>
							Upload your avatar:
						</FormLabel>

						<TextField
							type='file'
							slotProps={{
								htmlInput: { accept: 'image/png, image/gif, image/jpeg' }
							}}
							onChange={(event) => { selectAvatar(event.target.files[0]) }}
						/>
					</FormControl>
				</DialogContent>

				<DialogActions>
					<Button
						type='submit'
						variant='outlined'
						sx={{
							borderColor: 'lightgray',
							color: 'black',
							fontSize: '1.4rem',
							fontWeight: '400',
							padding: '0.5rem 2rem',
							textTransform: 'none',
							':hover': { backgroundColor: 'rgb(235, 235, 235)', color: 'black' }
						}}
						onClick={() => updateProfile()}
					>
						Submit
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	);
};

export default SettingsModal;