import { AppRoutes } from '@/routes';
import { AuthService } from '@/services/AuthService';
import { LoginDto } from '@/services/dtos/LoginDto';
import { useStore } from '@/store/store';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, Form, Input, Layout, notification, Row, Typography } from 'antd';
import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { AMUI_URL, isSaasBuild } from '../../services/BaseService';
import { extractErrorMsg } from '@/utils/ServiceUtils';
import { UsersService } from '@/services/UsersService';

interface LoginPageProps {
  isFullScreen?: boolean;
}

export default function LoginPage(props: LoginPageProps) {
  const [form] = Form.useForm<LoginDto>();
  const [notify, notifyCtx] = notification.useNotification();
  const store = useStore();
  const navigate = useNavigate();
  const { backend, token } = useParams();
  const { t } = useTranslation();

  const [shouldRemember, setShouldRemember] = useState(false);

  const onLogin = async () => {
    try {
      const formData = await form.validateFields();
      const data = await (await AuthService.login(formData)).data;
      store.setStore({ jwt: data.Response.AuthToken, username: data.Response.UserName });
      navigate(AppRoutes.DASHBOARD_ROUTE);
    } catch (err) {
      notify.error({ message: 'Failed to login', description: extractErrorMsg(err as any) });
    }
  };

  const checkIfServerHasAdminAndRedirect = useCallback(async () => {
    const hasAdmin = (await UsersService.serverHasAdmin()).data;
    if (!hasAdmin) navigate(AppRoutes.SIGNUP_ROUTE);
  }, [navigate]);

  // const onSSOLogin = useCallback(() => {}, []);

  useEffect(() => {
    checkIfServerHasAdminAndRedirect();
  }, [checkIfServerHasAdminAndRedirect]);

  if (isSaasBuild) {
    if (!backend && !token) {
      window.location.href = AMUI_URL;
      return null;
    }
    store.setStore({ jwt: token, baseUrl: backend });
    // TODO: load username
    navigate(AppRoutes.DASHBOARD_ROUTE);
  }

  if (store.isLoggedIn()) {
    navigate(AppRoutes.DASHBOARD_ROUTE);
  }

  return (
    <Layout style={{ height: '100%', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <Layout.Content
        style={{
          marginTop: '15vh',
          position: 'relative',
          height: 'fit-content',
          width: '40%',
          padding: props.isFullScreen ? 0 : 24,
        }}
      >
        <Row>
          <Col xs={24}>
            <Typography.Title level={2}>{t('signin.signin')}</Typography.Title>
          </Col>
        </Row>

        <Form
          form={form}
          layout="vertical"
          onKeyUp={(ev) => {
            if (ev.key === 'Enter') {
              onLogin();
            }
          }}
        >
          <Form.Item name="username" label={t('signin.username')} rules={[{ required: true }]}>
            <Input placeholder={String(t('signin.username'))} size="large" prefix={<MailOutlined />} />
          </Form.Item>
          <Form.Item name="password" label={t('signin.password')} rules={[{ required: true }]}>
            <Input placeholder={String(t('signin.password'))} type="password" size="large" prefix={<LockOutlined />} />
          </Form.Item>

          <Row style={{ marginBottom: '1.5rem' }}>
            <Col>
              <Checkbox checked={shouldRemember} onChange={(e) => setShouldRemember(e.target.checked)}>
                {' '}
                <Typography.Text>{t('signin.rememberme')}</Typography.Text>
              </Checkbox>
            </Col>
          </Row>

          <Typography.Text>
            {t('signin.terms1')} {/* eslint-disable-next-line react/jsx-no-target-blank */}
            <a href="https://www.netmaker.io/terms-and-conditions" target="_blank">
              {t('signin.terms2')}
            </a>{' '}
            {t('signin.terms3')} {/* eslint-disable-next-line react/jsx-no-target-blank */}
            <a href="https://www.netmaker.io/privacy-policy" target="_blank">
              {t('signin.terms4')}
            </a>
            .
          </Typography.Text>

          <Form.Item style={{ marginTop: '1.5rem' }}>
            <Button type="primary" block onClick={onLogin}>
              {t('signin.signin')}
            </Button>
          </Form.Item>
          {/* <Divider>
            <Typography.Text>{t('signin.or')}</Typography.Text>
          </Divider>
          <Form.Item style={{ marginTop: '1.5rem' }}>
            <Button type="default" block onClick={onSSOLogin}>
              {t('signin.sso')}
            </Button>
          </Form.Item> */}
        </Form>
      </Layout.Content>

      {/* misc */}
      {notifyCtx}
    </Layout>
  );
}