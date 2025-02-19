'use client';
import React, { useState, useEffect } from 'react';
import { AudioOutlined, LeftOutlined, GithubOutlined, MenuOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme, ConfigProvider, Flex, Button, Drawer } from 'antd';
import clsx from 'clsx';
import { useRouter, usePathname } from 'next/navigation';
import LiveAPIProvider from '@/components/live-api-provider';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[]
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}

const items: MenuItem[] = [
    getItem('Stream Realtime', '/live', <AudioOutlined />),
];

const subItems: MenuItem[] = [getItem('Github', '/github', <GithubOutlined />)];

const GlobalLayout: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
    const {
        token: { colorBgLayout },
    } = theme.useToken();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
    const [windowWidth, setWindowWidth] = useState(isMobile);

    useEffect(() => {
        setMounted(true);
        const handleResize = () => {
            setWindowWidth(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!mounted) {
        return null;
    }

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        router.push(e.key);
        if (windowWidth) {
            setDrawerOpen(false);
        }
    };

    const handleSubMenuClick: MenuProps['onClick'] = (e) => {
        if (e.key === '/github') {
            window.open(
                'https://github.com/ElricLiu/Gemini-Next-Web',
                '_blank'
            );
        }
    };

    const sidebarContent = (
        <>
            <div
                className='h-8 m-4 rounded-lg text-lg font-medium text-center overflow-hidden relative'
                style={{ background: colorBgLayout }}
            >
                <div
                    className={clsx(
                        'transition-transform duration-500 ease-in-out absolute w-full left-0 top-0 overflow-hidden font-medium text-2xl',
                        {
                            'translate-x-full': collapsed && !windowWidth,
                            'translate-x-0': !collapsed || windowWidth,
                        }
                    )}
                >
                    Gemini-Next-Web
                </div>
                <div
                    className={clsx(
                        'transition-transform duration-500 ease-in-out absolute w-full left-0 top-0 flex justify-center',
                        {
                            'translate-x-0': collapsed && !windowWidth,
                            '-translate-x-full': !collapsed || windowWidth,
                        }
                    )}
                >
                    <svg
                        width='29'
                        height='30'
                        viewBox='0 0 29 30'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path
                            d='M18.1591 17.0322C18.1163 17.5027 18.2662 17.9782 18.5859 18.326C18.9055 18.6737 19.357 18.8578 19.7673 19.0214C20.2154 19.1987 20.6027 19.3436 21.0212 19.5941C21.41...
                            fill='#87A9FF'
                        ></path>
                        <path
                            d='M19.886 15.6415C20.3358 15.3756 20.756 15.1881 21.2453 15.0142C21.7166 14.8472 22.196 14.7091 22.6805 14.5847C23.1633 14.4603 23.651 14.3546 24.1387 14.2489C24.6264...
                            fill='#0057CE'
                        ></path>
                        <path
                            d='M9.62059 17.1674C9.46241 16.9867 9.29764 16.8145 9.11474 16.6611C9.34212 17.06 9.36519 17.5117 9.26962 17.9463C9.17406 18.3793 8.96315 18.7799 8.69622 19.1242C8.421...
                            fill='#87A9FF'
                        ></path>
                        <path
                            d='M4.45504 6.30371C6.13076 6.30201 7.75705 7.25484 8.93516 8.32358C10.1858 9.45879 11.1546 10.9042 11.7923 12.4758C12.4332 14.0559 12.7414 15.7638 12.7298 17.4701C12....
                            fill='#0057CE'
                        ></path>
                    </svg>
                </div>
            </div>
            <Flex vertical justify='space-between' style={{ flex: 1, height: 'calc(100vh - 64px)' }}>
                <Menu
                    theme='light'
                    mode='inline'
                    defaultSelectedKeys={[pathname]}
                    items={items}
                    onClick={handleMenuClick}
                    style={{ background: colorBgLayout }}
                />
                <div>
                    <Menu
                        theme='light'
                        mode='inline'
                        items={subItems}
                        onClick={handleSubMenuClick}
                        style={{ background: colorBgLayout }}
                    />
                    {!windowWidth && (
                        <div
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                width: collapsed ? 60 : 230,
                                color: '#000',
                                background: colorBgLayout,
                                padding: '0 10px',
                                boxSizing: 'border-box',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                height: 48,
                                lineHeight: '48px',
                            }}
                        >
                            <LeftOutlined rotate={collapsed ? 180 : 0} />
                        </div>
                    )}
                </div>
            </Flex>
        </>
    );

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.defaultAlgorithm,
            }}
        >
            <Layout style={{ minHeight: '100vh' }}>
                {!windowWidth ? (
                    <Sider
                        width={250}
                        trigger={null}
                        collapsible
                        collapsed={collapsed}
                        onCollapse={(value) => setCollapsed(value)}
                        style={{
                            background: colorBgLayout,
                            padding: '0 10px',
                            height: '100vh',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {sidebarContent}
                    </Sider>
                ) : (
                    <Drawer
                        title="Gemini-Next-Web"
                        placement="left"
                        onClose={() => setDrawerOpen(false)}
                        open={drawerOpen}
                        width={250}
                        styles={{
                            body: {
                                padding: 0,
                                background: colorBgLayout,
                            },
                        }}
                    >
                        {sidebarContent}
                    </Drawer>
                )}
                <Layout>
                    {windowWidth && (
                        <div style={{ 
                            padding: '16px', 
                            background: colorBgLayout,
                            borderBottom: '1px solid rgba(0,0,0,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <Button
                                icon={<MenuOutlined />}
                                onClick={() => setDrawerOpen(true)}
                            />
                            <Button
                                icon={<SettingOutlined />}
                                onClick={() => setRightDrawerOpen(true)} // Directly open the right drawer
                            />
                        </div>
                    )}
                    <LiveAPIProvider>{children}</LiveAPIProvider>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default GlobalLayout;