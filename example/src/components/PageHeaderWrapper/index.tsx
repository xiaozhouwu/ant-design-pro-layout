import React from 'react';
import { PageHeader, Tabs, Typography } from 'antd';
import { connect } from 'dva';
import classNames from 'classnames';
import GridContent from './GridContent';
import { ConnectState, MenuDataItem } from '../../models/connect';
import styles from './index.less';
import * as H from 'history';

const { Title } = Typography;

/**
 * render Footer tabList
 * In order to be compatible with the old version of the PageHeader
 * basically all the functions are implemented.
 */
const renderFooter = ({
  tabList,
  onTabChange,
  tabBarExtraContent,
}: Partial<PageHeaderWrapperProps>) => {
  return tabList && tabList.length ? (
    <Tabs
      className={styles.tabs}
      onChange={key => {
        if (onTabChange) {
          onTabChange(key);
        }
      }}
      tabBarExtraContent={tabBarExtraContent}
    >
      {tabList.map(item => (
        <Tabs.TabPane tab={item.tab} key={item.key} />
      ))}
    </Tabs>
  ) : null;
};

export interface PageHeaderWrapperProps {
  title?: React.ReactNode | string | number;
  logo?: React.ReactNode | string;
  action?: React.ReactNode | string;
  content?: React.ReactNode;
  extraContent?: React.ReactNode;
  breadcrumbList?: Array<{ title: string; href: string }>;
  tabList?: Array<{ key: string; tab: React.ReactNode }>;
  tabActiveKey?: string;
  onTabChange?: (key: string) => void;
  tabBarExtraContent?: React.ReactNode;
  style?: React.CSSProperties;
  home?: string;
  breadcrumb: any;
  className?: string;
  children?: React.ReactNode;
  wrapperClassName?: string;
  top?: React.ReactNode;
  location?: H.Location;
  breadcrumbNameMap?: { [path: string]: MenuDataItem };
}

class PageHeaderWrapper extends React.Component<PageHeaderWrapperProps> {
  mergePropsAndChildren = (): PageHeaderWrapperProps => {
    return {
      ...this.props,
    };
  };
  renderPageHeader = () => {
    const {
      children,
      wrapperClassName,
      top,
      title,
      content,
      logo,
      extraContent,
      breadcrumb,
      ...restProps
    } = this.mergePropsAndChildren();
    let pageTitle = title;

    if (!title && breadcrumb.routes) {
      const router = breadcrumb.routes[breadcrumb.routes.length - 1];
      if (router) {
        pageTitle = router.breadcrumbName;
      }
    }
    if (!pageTitle && !content) {
      return;
    }
    return (
      <PageHeader
        title={
          <Title
            level={4}
            style={{
              marginBottom: 0,
            }}
          >
            {pageTitle}
          </Title>
        }
        {...restProps}
        breadcrumb={breadcrumb}
        className={styles.pageHeader}
        footer={renderFooter(restProps)}
      >
        <div className={styles.detail}>
          {logo && <div className={styles.logo}>{logo}</div>}
          <div className={styles.main}>
            <div className={styles.row}>
              {content && <div className={styles.content}>{content}</div>}
              {extraContent && <div className={styles.extraContent}>{extraContent}</div>}
            </div>
          </div>
        </div>
      </PageHeader>
    );
  };
  render() {
    const { children } = this.mergePropsAndChildren();
    return (
      <div style={{ margin: '-24px -24px 0' }} className={classNames(classNames, styles.main)}>
        {this.renderPageHeader()}
        {children ? <div className={styles['children-content']}>{children}</div> : null}
      </div>
    );
  }
}

export default connect(({ setting }: ConnectState) => ({
  contentWidth: setting.contentWidth,
}))(PageHeaderWrapper);
