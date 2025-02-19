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
    const [rightDrawerOpen, setRightDrawerOpen] = useState(false); // 新增右侧抽屉状态
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

        // 添加右侧抽屉事件监听
        const toggleHandler = () => setRightDrawerOpen(prev => !prev);
        window.addEventListener('toggleRightDrawer', toggleHandler);

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('toggleRightDrawer', toggleHandler);
        };
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
                        {/* ...保持原有SVG内容不变 */}
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
                
                {/* 新增右侧抽屉 */}
                <Drawer
                    title="设置"
                    placement="right"
                    onClose={() => setRightDrawerOpen(false)}
                    open={rightDrawerOpen}
                    width={300}
                >
                    {/* 在这里添加你的设置面板内容 */}
                    <div>设置面板内容...</div>
                </Drawer>

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
                                onClick={() => {
                                    const event = new Event('toggleRightDrawer');
                                    window.dispatchEvent(event);
                                }}
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