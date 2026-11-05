import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerLandlord, registerStudent } from '../api/auth';
import { getErrorMessage, getErrorStatus, mapFieldErrors } from '../api/errors';
import { AuthCard } from '../components/auth/AuthCard';
import { RoleSelector } from '../components/auth/RoleSelector';
import { UniversitySelect } from '../components/UniversitySelect';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { useAuth } from '../hooks/useAuth';
import { useForm, type FormErrors } from '../hooks/useForm';
import { PATHS } from '../routes/paths';
import type { AuthResponse, RegisterRole } from '../types/auth';
import { validateEmail, validateName, validatePassword } from '../utils/validators';

interface RegisterFormValues {
  role: RegisterRole;
  name: string;
  email: string;
  password: string;
  universityId: number | '';
}

const INITIAL_VALUES: RegisterFormValues = {
  role: 'ESTUDIANTE',
  name: '',
  email: '',
  password: '',
  universityId: '',
};

// Backend field name -> form field name (for 400 "errores")
const SERVER_FIELDS: Record<string, keyof RegisterFormValues> = {
  nombre: 'name',
  correo: 'email',
  contrasena: 'password',
  universidadId: 'universityId',
};

function validateRegisterForm(values: RegisterFormValues): FormErrors<RegisterFormValues> {
  const isStudent = values.role === 'ESTUDIANTE';
  return {
    name: validateName(values.name),
    email: validateEmail(values.email, { requireEduPe: isStudent }),
    password: validatePassword(values.password),
    universityId: isStudent && values.universityId === '' ? 'Selecciona tu universidad' : undefined,
  };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { values, setValue, getError, validateAll, setServerErrors } = useForm(
    INITIAL_VALUES,
    validateRegisterForm,
  );
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);

  const isStudent = values.role === 'ESTUDIANTE';

  function submitRegistration(): Promise<AuthResponse> {
    const body = {
      nombre: values.name.trim(),
      correo: values.email.trim().toLowerCase(),
      contrasena: values.password,
    };
    return isStudent
      ? registerStudent({ ...body, universidadId: Number(values.universityId) })
      : registerLandlord(body);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneralError(null);
    if (!validateAll()) return;

    setSubmitting(true);
    try {
      const response = await submitRegistration();
      signIn(response); // EP 002/003 already return tokens: user is logged in
      if (response.rol === 'ARRENDADOR') {
        setPendingVerification(true);
      } else {
        navigate(PATHS.home, { replace: true });
      }
    } catch (error) {
      const fieldErrors = mapFieldErrors(error, SERVER_FIELDS);
      const status = getErrorStatus(error);
      if (status === 409) fieldErrors.email = 'Este correo ya está registrado';
      if (status === 404) fieldErrors.universityId = 'La universidad seleccionada no existe';

      setServerErrors(fieldErrors);
      setGeneralError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (pendingVerification) {
    return (
      <AuthCard title="¡Cuenta creada!">
        <Alert variant="info">
          Tu cuenta de arrendador está pendiente de verificación. Un administrador la revisará y,
          cuando esté aprobada, podrás publicar tus habitaciones.
        </Alert>
        <Button onClick={() => navigate(PATHS.home, { replace: true })}>Ir al inicio</Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Regístrate"
      subtitle="Crea tu cuenta en MuvU"
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to={PATHS.login} className="font-medium text-blue-600 hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <RoleSelector value={values.role} onChange={(role) => setValue('role', role)} />

      {generalError && <Alert variant="error">{generalError}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          label="Nombre"
          name="name"
          autoComplete="name"
          placeholder="Ej. Ana Ramos"
          value={values.name}
          onChange={(e) => setValue('name', e.target.value)}
          error={getError('name')}
        />

        <TextField
          label="Correo"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={isStudent ? 'tu.nombre@utec.edu.pe' : 'tu@correo.com'}
          hint={isStudent ? 'Usa tu correo universitario (.edu.pe)' : undefined}
          value={values.email}
          onChange={(e) => setValue('email', e.target.value)}
          error={getError('email')}
        />

        <TextField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="8 a 64 caracteres, con mayúscula, minúscula, número y símbolo"
          value={values.password}
          onChange={(e) => setValue('password', e.target.value)}
          error={getError('password')}
        />

        {isStudent && (
          <div className="space-y-1">
            <label htmlFor="universityId" className="block text-sm font-medium text-gray-700">
              Universidad
            </label>
            <UniversitySelect
              id="universityId"
              value={values.universityId}
              onChange={(universityId) => setValue('universityId', universityId)}
              invalid={Boolean(getError('universityId'))}
            />
            {getError('universityId') && (
              <p className="text-sm text-red-600">{getError('universityId')}</p>
            )}
          </div>
        )}

        <Button type="submit" loading={submitting}>
          {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthCard>
  );
}