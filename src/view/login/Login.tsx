import { useState, useEffect, useRef } from 'react';
import { Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Title from './component/Title';
import Form from './component/Form';
import { signIn } from '../../redux/principalSlice';
import { isEmpty } from '../../helper/utils.helper';
import { useAppSelector } from '@/redux/hooks';
import { authenticateUsuario } from '@/network/rest/api-client';

const Login = () => {
  const dispatch = useDispatch();
  const token = useAppSelector((state) => state.principal);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [lookPassword, setLookPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    const eventFocused = () => {
      const userToken = window.localStorage.getItem('login');
      if (userToken === null) {
        return;
      }

      const projectToken = window.localStorage.getItem('project');
      if (projectToken !== null) {
        dispatch(signIn({
          token: JSON.parse(userToken),
          project: JSON.parse(projectToken),
        }));
      } else {
        dispatch(signIn({
          token: JSON.parse(userToken),
          project: null,
        }));
      }
    };

    if (usernameRef.current !== null) {
      usernameRef.current.focus();
    }
    window.addEventListener('focus', eventFocused);

    return () => {
      window.removeEventListener('focus', eventFocused);
    };
  }, [dispatch]);

  const handleSendForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    if (isEmpty(username)) {
      usernameRef.current.focus();
      setMessage('Ingrese su usuario para iniciar sesión.');
      return;
    }

    if (isEmpty(password)) {
      passwordRef.current.focus();
      setMessage('Ingrese su contraseña para iniciar sesión.');
      return;
    }

    (document.activeElement as HTMLElement).blur();

    setLoading(true);

    const body = {
      username: username,
      password: password,
    };

    const { success, data, message } = await authenticateUsuario(body);

    if (!success) {
      setLoading(false);
      setMessage(message);
      usernameRef.current.focus();
      return;
    }

    window.localStorage.setItem('login', JSON.stringify(data));

    dispatch(signIn({
      token: data,
      project: null,
    }));
  };

  const handleChangeUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setUsername(value);
    if (value.length > 0) {
      setMessage('');
    } else {
      setMessage('Ingrese su usuario para iniciar sesión.');
    }
  };

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPassword(value);
    if (value.length > 0) {
      setMessage('');
    } else {
      setMessage('Ingrese su contraseña para iniciar sesión.');
    }
  };

  const handleViewPassword = () => {
    setLookPassword(!lookPassword);
    setTimeout(() => {
      const input = passwordRef.current;
      if (input) {
        input.focus();
        const length = input.value.length;
        input.setSelectionRange(length, length);
      }
    }, 0);
  };

  if (token.userToken != null) {
    return <Redirect to="/principal" />;
  }

  return (
    <div className="h-full bg-accent">
      <div className="container h-full">
        <div className="h-full flex justify-center items-center py-4">
          <Title />

          <Form
            loading={loading}
            message={message}
            username={username}
            usernameRef={usernameRef}
            handleChangeUsername={handleChangeUsername}
            password={password}
            passwordRef={passwordRef}
            handleChangePassword={handleChangePassword}
            lookPassword={lookPassword}
            handleViewPassword={handleViewPassword}
            handleSendForm={handleSendForm}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
