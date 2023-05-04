import { useStore } from '@/store/store';
import { MoreOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Input,
  Layout,
  MenuProps,
  Modal,
  notification,
  Row,
  Skeleton,
  Switch,
  Table,
  TableColumnsType,
  Tabs,
  TabsProps,
  Tag,
  Typography,
} from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageProps } from '../../models/Page';
import './UsersPage.scss';
import { Network } from '@/models/Network';
import { extractErrorMsg } from '@/utils/ServiceUtils';
import { UsersService } from '@/services/UsersService';
import { User } from '@/models/User';
import { UserGroup } from '@/models/UserGroup';
import AddUserModal from '@/components/modals/add-user-modal/AddUserModal';
import AddUserGroupModal from '@/components/modals/add-user-group-modal/AddUserGroupModal';
import UpdateUserGroupModal from '@/components/modals/update-user-group-modal/UpdateUserGroupModal';
import UpdateUserModal from '@/components/modals/update-user-modal/UpdateUserModal';
import NetworkPermissionsModal from '@/components/modals/network-permissions-modal/NetworkPermissionsModal';
import { isSaasBuild } from '@/services/BaseService';
import { getAmuiUrl } from '@/utils/RouteUtils';

export default function UsersPage(props: PageProps) {
  const [notify, notifyCtx] = notification.useNotification();
  const store = useStore();

  const [users, setUsers] = useState<User[]>([]);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usersSearch, setUsersSearch] = useState('');
  const [networksSearch, setNetworksSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [isUpdateGroupModalOpen, setIsUpdateGroupModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isUpdateUserModalOpen, setIsUpdateUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isNetworkPermissionsModalOpen, setIsNetworkPermissionsModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const users = (await UsersService.getUsers()).data;
      setUsers(users);
    } catch (err) {
      notify.error({
        message: 'Failed to load users',
        description: extractErrorMsg(err as any),
      });
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  const loadUserGroups = useCallback(async () => {
    try {
      const groups = await UsersService.getUserGroups();
      setUserGroups(groups);
    } catch (err) {
      notify.error({
        message: 'Failed to load user groups',
        description: extractErrorMsg(err as any),
      });
    }
  }, [notify]);

  const confirmDeleteUser = useCallback(
    async (user: User) => {
      Modal.confirm({
        title: 'Delete user',
        content: `Are you sure you want to delete user ${user.username}?`,
        onOk: async () => {
          try {
            await UsersService.deleteUser(user.username);
            notify.success({ message: `User ${user.username} deleted` });
            setUsers((users) => users.filter((u) => u.username !== user.username));
          } catch (err) {
            notify.error({
              message: 'Failed to delete user',
              description: extractErrorMsg(err as any),
            });
          }
        },
      });
    },
    [notify]
  );

  const confirmDeleteGroup = useCallback(
    async (group: UserGroup) => {
      Modal.confirm({
        title: 'Delete user group',
        content: `Are you sure you want to delete group ${group}?`,
        onOk: async () => {
          try {
            await UsersService.deleteUserGroup(group);
            notify.success({ message: `User group ${group} deleted` });
            loadUsers();
            loadUserGroups();
          } catch (err) {
            notify.error({
              message: 'Failed to delete user group',
              description: extractErrorMsg(err as any),
            });
          }
        },
      });
    },
    [loadUserGroups, loadUsers, notify]
  );

  const onEditUser = useCallback((user: User) => {
    setSelectedUser(user);
    setIsUpdateUserModalOpen(true);
  }, []);

  const onEditGroup = useCallback((group: UserGroup) => {
    setSelectedGroup(group);
    setIsUpdateGroupModalOpen(true);
  }, []);

  const onAddUser = useCallback(() => {
    if (isSaasBuild) {
      window.location = getAmuiUrl('invite-user') as any;
      return;
    } else {
      setIsAddUserModalOpen(true);
    }
  }, []);

  const usersTableColumns: TableColumnsType<User> = useMemo(
    () => [
      {
        title: 'Username',
        dataIndex: 'username',
        sorter(a, b) {
          return a.username.localeCompare(b.username);
        },
        defaultSortOrder: 'ascend',
      },
      {
        title: 'Role',
        render(_, user) {
          return <Tag color={user.isadmin ? 'warning' : 'default'}>{user.isadmin ? 'Admin' : 'User'}</Tag>;
        },
      },
      {
        title: 'Groups',
        render(_, user) {
          return <Typography.Text>{user.groups?.join(', ')}</Typography.Text>;
        },
      },
      {
        width: '1rem',
        render(_, user) {
          return (
            <Dropdown
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: 'edit',
                    label:
                      !user.isadmin || (user.isadmin && user.username === store.username) ? (
                        <Typography.Text
                          onClick={(ev) => {
                            ev.stopPropagation();
                            onEditUser(user);
                          }}
                        >
                          Edit
                        </Typography.Text>
                      ) : (
                        <></>
                      ),
                  },
                  {
                    key: 'default',
                    label: (
                      <Typography.Text
                        onClick={(ev) => {
                          ev.stopPropagation();
                          confirmDeleteUser(user);
                        }}
                      >
                        Delete
                      </Typography.Text>
                    ),
                  },
                ] as MenuProps['items'],
              }}
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          );
        },
      },
    ],
    [confirmDeleteUser, onEditUser, store.username]
  );

  const networksTableColumns: TableColumnsType<Network> = useMemo(
    () => [
      {
        title: 'Network',
        dataIndex: 'netid',
        render(_, network) {
          return (
            <Typography.Link
              onClick={() => {
                setSelectedNetwork(network);
                setIsNetworkPermissionsModalOpen(true);
              }}
            >
              {network.netid}
            </Typography.Link>
          );
        },
        sorter(a, b) {
          return a.netid.localeCompare(b.netid);
        },
        defaultSortOrder: 'ascend',
      },
      {
        title: 'Default Access Level',
        render(_, network) {
          switch (network.prosettings?.defaultaccesslevel) {
            case 0:
              return <Tag>0 - Network Admin</Tag>;
            case 1:
              return <Tag>1 - Host Access</Tag>;
            case 2:
              return <Tag>2 - Client Access</Tag>;
            case 3:
              return <Tag>3 - No Access</Tag>;
          }
        },
        sorter(a, b) {
          return (a.prosettings?.defaultaccesslevel ?? 0) - (b.prosettings?.defaultaccesslevel ?? 0);
        },
      },
      {
        title: 'Allowed Groups',
        render(_, network) {
          return network.prosettings?.allowedgroups.length;
        },
        sorter(a, b) {
          return (a.prosettings?.allowedgroups.length ?? 0) - (b.prosettings?.allowedgroups.length ?? 0);
        },
      },
      {
        title: 'Allowed Users',
        render(_, network) {
          return network.prosettings?.allowedusers.length;
        },
        sorter(a, b) {
          return (a.prosettings?.allowedusers.length ?? 0) - (b.prosettings?.allowedusers.length ?? 0);
        },
      },
    ],
    []
  );

  const groupTableCols: TableColumnsType<{ name: UserGroup }> = useMemo(
    () => [
      {
        title: 'Name',
        render(_, group) {
          return <Typography.Text>{group.name}</Typography.Text>;
        },
        sorter(a, b) {
          return a.name.localeCompare(b.name);
        },
        defaultSortOrder: 'ascend',
      },
      {
        title: 'Users',
        render(_, group) {
          let usersCount = 0;
          users.forEach((u) => {
            if (u.groups?.includes(group.name)) {
              usersCount++;
            }
          });
          return <Typography.Text>{usersCount}</Typography.Text>;
        },
      },
      {
        width: '1rem',
        render(_, group) {
          return (
            <Dropdown
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: 'edit',
                    label: (
                      <Typography.Text
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onEditGroup(group.name);
                        }}
                      >
                        Edit
                      </Typography.Text>
                    ),
                  },
                  {
                    key: 'delete',
                    label: (
                      <Typography.Text
                        onClick={(ev) => {
                          ev.stopPropagation();
                          confirmDeleteGroup(group.name);
                        }}
                      >
                        Delete
                      </Typography.Text>
                    ),
                  },
                ] as MenuProps['items'],
              }}
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          );
        },
      },
    ],
    [confirmDeleteGroup, onEditGroup, users]
  );

  const usersTableCols2 = usersTableColumns;

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      return u.username.toLowerCase().includes(usersSearch.trim().toLowerCase());
    });
  }, [users, usersSearch]);

  const filteredNetworks = useMemo(
    () => store.networks.filter((net) => net.netid.toLocaleLowerCase().includes(networksSearch.trim().toLowerCase())),
    [store.networks, networksSearch]
  );

  const filteredGroups = useMemo(() => {
    return userGroups
      .map((g) => ({ name: g }))
      .filter((g) => g.name.toLowerCase().includes(groupSearch.trim().toLowerCase()));
  }, [groupSearch, userGroups]);

  const filteredGroupUsers = useMemo(() => {
    if (selectedGroup) {
      return users.filter((u) => u.groups?.includes(selectedGroup));
    }
    const groupsMap = filteredGroups.reduce((acc, g) => {
      acc[g.name] = true;
      return acc;
    }, {} as Record<UserGroup, boolean>);
    return users.filter((u) => u.groups?.some((g) => groupsMap[g]));
  }, [filteredGroups, selectedGroup, users]);

  // ui components
  const getUsersContent = useCallback(() => {
    return (
      <>
        <Row>
          <Col xs={24} md={8}>
            <Input
              size="large"
              placeholder="Search users"
              prefix={<SearchOutlined />}
              value={usersSearch}
              onChange={(ev) => setUsersSearch(ev.target.value)}
            />
          </Col>
          <Col xs={24} md={16} style={{ textAlign: 'right' }}>
            <Button type="primary" size="large" onClick={onAddUser}>
              <PlusOutlined /> Add a User
            </Button>
          </Col>
        </Row>
        <Row className="" style={{ marginTop: '1rem' }}>
          <Col xs={24}>
            <Table columns={usersTableColumns} dataSource={filteredUsers} rowKey="username" />
          </Col>
        </Row>
      </>
    );
  }, [filteredUsers, usersSearch, usersTableColumns, onAddUser]);

  const getNetworkPermissionsContent = useCallback(() => {
    return (
      <>
        <Row>
          <Col xs={24} md={8}>
            <Input
              size="large"
              placeholder="Search networks"
              prefix={<SearchOutlined />}
              value={networksSearch}
              onChange={(ev) => setNetworksSearch(ev.target.value)}
            />
          </Col>
        </Row>
        <Row className="" style={{ marginTop: '1rem' }}>
          <Col xs={24}>
            <Table columns={networksTableColumns} dataSource={filteredNetworks} rowKey="netid" />
          </Col>
        </Row>
      </>
    );
  }, [networksSearch, networksTableColumns, filteredNetworks]);

  const getGroupsContent = useCallback(() => {
    return (
      <Row style={{ width: '100%' }}>
        <Col xs={24} style={{ marginBottom: '2rem' }}>
          <Input
            placeholder="Search group"
            value={groupSearch}
            onChange={(ev) => setGroupSearch(ev.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: '30%' }}
          />
        </Col>
        <Col xs={12}>
          <Row style={{ width: '100%' }}>
            <Col xs={12}>
              <Typography.Title style={{ marginTop: '0px' }} level={5}>
                Groups
              </Typography.Title>
            </Col>
            <Col xs={11} style={{ textAlign: 'right' }}>
              <Button type="primary" onClick={() => setIsAddGroupModalOpen(true)}>
                <PlusOutlined /> Create Group
              </Button>
            </Col>
          </Row>
          <Row style={{ marginTop: '1rem' }}>
            <Col xs={23}>
              <Table
                columns={groupTableCols}
                dataSource={filteredGroups}
                rowKey={(group) => group.name}
                size="small"
                rowClassName={(group) => {
                  return group.name === selectedGroup ? 'selected-row' : '';
                }}
                onRow={(group) => {
                  return {
                    onClick: () => {
                      if (selectedGroup === group.name) setSelectedGroup(null);
                      else setSelectedGroup(group.name);
                    },
                  };
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={12}>
          <Row style={{ width: '100%' }}>
            <Col xs={12}>
              <Typography.Title style={{ marginTop: '0px' }} level={5}>
                Users
              </Typography.Title>
            </Col>
            <Col xs={12} style={{ textAlign: 'right' }}>
              {selectedGroup && (
                <Button
                  type="primary"
                  style={{ marginRight: '1rem' }}
                  onClick={() => {
                    onEditGroup(selectedGroup);
                  }}
                >
                  <PlusOutlined /> Add user to group
                </Button>
              )}
              Display All{' '}
              <Switch
                title="Display all user groups. Click a group to filter users only under that group."
                checked={selectedGroup === null}
                onClick={() => {
                  setSelectedGroup(null);
                }}
              />
            </Col>
          </Row>
          <Row style={{ marginTop: '1rem' }}>
            <Col xs={24}>
              <Table columns={usersTableCols2} dataSource={filteredGroupUsers} rowKey="username" size="small" />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }, [filteredGroupUsers, filteredGroups, groupSearch, groupTableCols, onEditGroup, selectedGroup, usersTableCols2]);

  const tabs: TabsProps['items'] = useMemo(
    () => [
      {
        key: 'users',
        label: 'Users',
        children: getUsersContent(),
      },
      {
        key: 'network-permissions',
        label: 'Network Permissions',
        children: getNetworkPermissionsContent(),
      },
      {
        key: 'groups',
        label: 'Groups',
        children: getGroupsContent(),
      },
    ],
    [getUsersContent, getNetworkPermissionsContent, getGroupsContent]
  );

  useEffect(() => {
    loadUsers();
    loadUserGroups();
  }, [loadUsers, loadUserGroups]);

  return (
    <Layout.Content
      className="UsersPage"
      style={{ position: 'relative', height: '100%', padding: props.isFullScreen ? 0 : 24 }}
    >
      <Skeleton loading={isLoading} active title={true} className="page-padding">
        {users.length === 0 && (
          <>
            <Row
              className="page-padding"
              style={{
                background: 'linear-gradient(90deg, #52379F 0%, #B66666 100%)',
              }}
            >
              <Col xs={(24 * 2) / 3}>
                <Typography.Title level={3} style={{ color: 'white ' }}>
                  Users
                </Typography.Title>
                <Typography.Text style={{ color: 'white ' }}>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque amet modi cum aut doloremque dicta
                  reiciendis odit molestias nam animi enim et molestiae consequatur quas quo facere magni, maiores rem.
                </Typography.Text>
              </Col>
              <Col xs={(24 * 1) / 3} style={{ position: 'relative' }}>
                <Card className="header-card" style={{ height: '20rem', position: 'absolute', width: '100%' }}>
                  <Typography.Title level={3}>Add a User</Typography.Title>
                  <Typography.Text>Users access the Netmaker UI to configure their networks.</Typography.Text>
                  <Row style={{ marginTop: 'auto' }}>
                    <Col>
                      <Button type="primary" size="large" onClick={onAddUser}>
                        <PlusOutlined /> Create a User
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            <Row style={{ marginTop: '8rem', padding: '0px 5.125rem' }} gutter={[0, 20]}>
              <Col xs={24}>
                <Typography.Title level={3}>Add a User</Typography.Title>
              </Col>

              <Col xs={7} style={{ marginRight: '1rem' }}>
                <Card>
                  <Typography.Title level={4} style={{ marginTop: '0px' }}>
                    Manage access to Netmaker
                  </Typography.Title>
                  <Typography.Text>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deleniti, beatae quis. Possimus commodi
                    quas eveniet, nostrum iure eaque unde illo deleniti obcaecati aut aliquid ab sapiente ipsum soluta
                    ex quis.
                  </Typography.Text>
                </Card>
              </Col>
              <Col xs={7} style={{ marginRight: '1rem' }}>
                <Card>
                  <Typography.Title level={4} style={{ marginTop: '0px' }}>
                    Manage access to Netmaker
                  </Typography.Title>
                  <Typography.Text>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deleniti, beatae quis. Possimus commodi
                    quas eveniet, nostrum iure eaque unde illo deleniti obcaecati aut aliquid ab sapiente ipsum soluta
                    ex quis.
                  </Typography.Text>
                </Card>
              </Col>
              <Col xs={7}>
                <Card>
                  <Typography.Title level={4} style={{ marginTop: '0px' }}>
                    Manage access to Netmaker
                  </Typography.Title>
                  <Typography.Text>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deleniti, beatae quis. Possimus commodi
                    quas eveniet, nostrum iure eaque unde illo deleniti obcaecati aut aliquid ab sapiente ipsum soluta
                    ex quis.
                  </Typography.Text>
                </Card>
              </Col>
            </Row>
          </>
        )}
        {users.length > 0 && (
          <>
            <Row className="page-row-padding">
              <Col xs={24}>
                <Typography.Title level={3}>Users</Typography.Title>
              </Col>
            </Row>

            <Row className="page-row-padding" justify="space-between">
              <Col xs={24}>
                <Tabs defaultActiveKey="users" items={tabs} />
              </Col>
            </Row>
          </>
        )}
      </Skeleton>

      {/* misc */}
      {notifyCtx}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onCreateUser={(user) => {
          setUsers([...users, user]);
          setIsAddUserModalOpen(false);
        }}
        onCancel={() => {
          setIsAddUserModalOpen(false);
        }}
      />
      <AddUserGroupModal
        isOpen={isAddGroupModalOpen}
        onCreateUserGroup={() => {
          loadUserGroups();
          loadUsers();
          setIsAddGroupModalOpen(false);
        }}
        onCancel={() => {
          setIsAddGroupModalOpen(false);
        }}
      />
      {selectedGroup && (
        <UpdateUserGroupModal
          isOpen={isUpdateGroupModalOpen}
          key={selectedGroup}
          group={selectedGroup}
          onUpdateUserGroup={() => {
            loadUserGroups();
            loadUsers();
            setIsUpdateGroupModalOpen(false);
          }}
          onCancel={() => {
            setIsUpdateGroupModalOpen(false);
            setSelectedGroup(null);
          }}
        />
      )}
      {selectedUser && (
        <UpdateUserModal
          isOpen={isUpdateUserModalOpen}
          key={selectedUser.username}
          user={selectedUser}
          onUpdateUser={() => {
            // loadUsers();
            setIsUpdateUserModalOpen(false);
          }}
          onCancel={() => {
            setIsUpdateUserModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
      {selectedNetwork && (
        <NetworkPermissionsModal
          key={selectedNetwork.netid}
          isOpen={isNetworkPermissionsModalOpen}
          network={selectedNetwork}
          onUpdate={() => {
            loadUsers();
          }}
          onCancel={() => {
            setIsNetworkPermissionsModalOpen(false);
            setSelectedNetwork(null);
          }}
        />
      )}
    </Layout.Content>
  );
}