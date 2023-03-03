import { Button, Card, Col, Layout, Row, Space } from 'antd';
import { ArrowRightOutlined, PlusOutlined } from '@ant-design/icons';
import UpgradeModal from '../components/modals/upgrade-modal/UpgradeModal';
import { PageProps } from '../models/Page';
import { AppRoutes } from '../routes';
import { useNavigate } from 'react-router-dom';
import AddNetworkModal from '@/components/modals/add-network-modal/AddNetworkModal';
import { useState } from 'react';

export default function DashboardPage(props: PageProps) {
  const navigate = useNavigate();

  const [isAddNetworkModalOpen, setIsAddNetworkModalOpen] = useState(false);

  const goToNewHostPage = () => {
    navigate(AppRoutes.NEW_HOST_ROUTE);
  };

  return (
    <Layout.Content style={{ padding: props.isFullScreen ? 0 : 24 }}>
      <Row>
        <Layout.Header></Layout.Header>
      </Row>
      <Row>
        <Col>
          <Space direction="vertical" size="middle">
            <Card>
              <h3>Start using Netmaker</h3>
              <p>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tempore impedit soluta reprehenderit quo velit
                corporis assumenda vel enim sed repellat quibusdam molestias voluptatibus illum magni laborum
                recusandae, odit saepe provident aliquam repudiandae iste nostrum, possimus at eligendi. Ab quibusdam
                sunt voluptates corporis nesciunt rem, libero doloribus officiis architecto accusantium aliquam nisi
                praesentium placeat explicabo tempore officia quia quod fuga quasi.
              </p>
              <div>
                <Button type="link">
                  <ArrowRightOutlined />
                  Take the tutorial
                </Button>
              </div>
            </Card>
            {/* TODO: check if no networks before rendering */}
            <Card style={{ maxWidth: '30%' }}>
              <h3>Add a network</h3>
              <p>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Consequatur possimus ex quae veritatis
                architecto esse.
              </p>
              <div>
                <Button type="primary" onClick={() => setIsAddNetworkModalOpen(true)}>
                  <PlusOutlined />
                  Get Started
                </Button>
              </div>
            </Card>
            {/* TODO: check if no networks and no hosts before rendering */}
            <Card style={{ maxWidth: '30%' }}>
              <h3>Add a host</h3>
              <p>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Consequatur possimus ex quae veritatis
                architecto esse.
              </p>
              <div>
                <Button type="primary" onClick={goToNewHostPage}>
                  <PlusOutlined />
                  Get Started
                </Button>
              </div>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* misc */}
      <UpgradeModal isOpen={false} />
      <AddNetworkModal isOpen={isAddNetworkModalOpen} onCancel={() => setIsAddNetworkModalOpen(false)} />
    </Layout.Content>
  );
}
