import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { getErrorMessage, mapFieldErrors } from '../api/errors';
import { AuthCard } from '../components/auth/AuthCard';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { useAuth } from '../hooks/useAuth';
import { useForm, type FormErrors } from '../hooks/useForm';
import { getDefaultPathForRole, PATHS } from '../routes/paths';
import { validateEmail } from '../utils/validators';

interface LoginFormValues {
  email: string;
  password: string;
}

// Optional data other pages send when redirecting here
interface LoginLocationState {
  from?: string;     // page the user wanted before being sent to login
  message?: string;  // e.g. "Your password was updated"
}

const INITIAL_VALUES: LoginFormValues = { email: '', password: '' };

const SERVER_FIELDS: Record<string, keyof LoginFormValues> = {
  correo: 'email',
  contrasena: 'password',
};

function validateLoginForm(values: LoginFormValues): FormErrors<LoginFormValues> {
  return {
    email: validateEmail(values.email),
    password: values.password ? undefined : 'La contraseña es obligatoria',
  };
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LoginLocationState | null;
  const { signIn } = useAuth();
  const { values, setValue, getError, validateAll, setServerErrors } = useForm(
    INITIAL_VALUES,
    validateLoginForm,
  );
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneralError(null);
    if (!validateAll()) return;

    setSubmitting(true);
    try {
      const response = await login({
        correo: values.email.trim().toLowerCase(),
        contrasena: values.password,
      });
      signIn(response);
      navigate(state?.from ?? getDefaultPathForRole(response.rol), { replace: true });
    } catch (error) {
      setServerErrors(mapFieldErrors(error, SERVER_FIELDS));
      setGeneralError(getErrorMessage(error)); // 401 -> "Correo o contraseña incorrectos"
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Inicia sesión"
      subtitle="Bienvenido de vuelta a MuvU"
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to={PATHS.register} className="font-medium text-blue-600 hover:underline">
            Regístrate
          </Link>
        </>
      }
    >
      {state?.message && <Alert variant="success">{state.message}</Alert>}
      {generalError && <Alert variant="error">{generalError}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          label="Correo"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          value={values.email}
          onChange={(e) => setValue('email', e.target.value)}
          error={getError('email')}
        />

        <TextField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(e) => setValue('password', e.target.value)}
          error={getError('password')}
        />

        <div className="text-right">
          <Link to={PATHS.forgotPassword} className="text-sm font-medium text-blue-600 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" loading={submitting}>
          {submitting ? 'Ingresando...' : 'Iniciar sesión'}
        </Button>
      </form>
    </AuthCard>
  );
}