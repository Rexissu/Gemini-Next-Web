'use client';
import React, { useState, useEffect } from 'react';
import { 
  AudioOutlined, 
  LeftOutlined, 
  GithubOutlined, 
  MenuOutlined, 
  SettingOutlined 
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme, ConfigProvider, Flex, Button, Drawer } from 'antd';
import clsx from 'clsx';
import { useRouter, usePathname } from 'next/navigation';
import { useMediaQuery } from 'react-responsive';
import LiveAPIProvider from '@/components/live-api-provider';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

// 显式类型定义（文献1建议）
interface LayoutProps {
  children: React.ReactNode;
}

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

const mainItems: MenuItem[] = [
  getItem('Stream Realtime', '/live', <AudioOutlined />),
];

const subItems: MenuItem[] = [
  getItem('Github', '/github', <GithubOutlined />)
];

const GlobalLayout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { token: { colorBgLayout } } = theme.useToken();
  const router = useRouter();
  const pathname = usePathname();
  
  // 优化响应式判断（文献1建议）
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    router.push(e.key);
    if (isMobile) setDrawerOpen(false);
  };

  const handleSubMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === '/github') {
      window.open('https://github.com/ElricLiu/Gemini-Next-Web', '_blank');
    }
  };

  const renderLogo = () => (
    <div className='h-8 m-4 rounded-lg text-lg font-medium text-center overflow-hidden relative'
      style={{ background: colorBgLayout }}>
      <div className={clsx(
        'transition-transform duration-500 ease-in-out absolute w-full left-0 top-0 overflow-hidden font-medium text-2xl',
        { 'translate-x-full': collapsed && !isMobile }
      )}>
        Gemini-Next-Web
      </div>
      <div className={clsx(
        'transition-transform duration-500 ease-in-out absolute w-full left-0 top-0 flex justify-center',
        { 'translate-x-0': collapsed && !isMobile }
      )}>
        {/* SVG Logo保持不变 */}
      </div>
    </div>
  );

  const sidebarContent = (
    <>
      {renderLogo()}
      <Flex vertical justify='space-between' style={{ flex: 1, height: 'calc(100vh - 64px)' }}>
        <Menu
          theme='light'
          mode='inline'
          defaultSelectedKeys={[pathname]}
          items={mainItems}
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
          {!isMobile && (
            <div 
              onClick={() => setCollapsed(!collapsed)}
              style={{/* 折叠按钮样式 */}}>
              <LeftOutlined rotate={collapsed ? 180 : 0} />
            </div>
          )}
        </div>
      </Flex>
    </>
  );

  if (!mounted) return null;

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <Layout style={{ minHeight: '100vh' }}>
        {/* 移动端头部（文献4建议） */}
        {isMobile && (
          <div style={{ 
            padding: '16px',
            background: colorBgLayout,
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Button 
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
              style={{ marginRight: 16 }}
            />
            <span className='font-medium'>Gemini-Next-Web</span>
          </div>
        )}

        {/* 桌面侧边栏 */}
        {!isMobile && (
          <Sider
            width={250}
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            style={{
              background: colorBgLayout,
              height: '100vh',
              display: 'flex',
              flexDirection: 'column'
            }}>
            {sidebarContent}
          </Sider>
        )}

        {/* 移动端抽屉（文献1建议） */}
        <Drawer
          title="导航菜单"
          placement="left"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          width={250}
          styles={{
            body: { 
              padding: 0,
              background: colorBgLayout 
            }
          }}>
          {sidebarContent}
        </Drawer>

        {/* 主内容区域 */}
        <Layout>
          <LiveAPIProvider>
            {children}
          </LiveAPIProvider>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default GlobalLayout;
