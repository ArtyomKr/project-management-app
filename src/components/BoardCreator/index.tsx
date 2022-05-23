import React from 'react';
import { Box, TextField, Typography, Button, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCreateBoardMutation } from '../../services';
import { Modal } from '..';

interface ICreatorState {
  title: string;
  description: string;
}

interface IBoardCreator {
  isOpened: boolean;
  onCancel: () => void;
}

const initialState = {
  title: '',
  description: '',
};

function BoardCreator({ isOpened, onCancel }: IBoardCreator) {
  const [createBoard, { isLoading }] = useCreateBoardMutation();
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<ICreatorState>({
    defaultValues: initialState,
  });

  const onSubmit = async (data: ICreatorState) => {
    await createBoard({
      title: data.title,
      description: '',
    });

    onCancel();
  };

  return (
    <Modal isOpened={isOpened} onCancel={onCancel}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} maxWidth={500}>
        <Typography variant="h5" sx={{ fontFamily: 'Ubuntu', fontWeight: 500 }} align="center">
          {t('pages.mainPage.createBtn')}
        </Typography>
        <TextField
          label={t('pages.mainPage.fieldTitle')}
          variant="standard"
          sx={{ mb: 2, mt: 2 }}
          fullWidth
          {...register('title', { required: t('form.errors.noTitle') })}
          error={!!errors.title}
          helperText={errors.title?.message}
        />
        <TextField multiline rows={4} label="description" />
        <Button
          type="submit"
          variant="contained"
          sx={{ width: '75%' }}
          startIcon={isLoading && <CircularProgress color="secondary" size={20} />}
        >
          {t('actions.create')}
        </Button>
      </Box>
    </Modal>
  );
}

export default BoardCreator;
