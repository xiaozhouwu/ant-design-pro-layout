import { Route, MenuDataItem } from '../typings';
import isEqual from 'lodash/isEqual';
import memoizeOne from 'memoize-one';
import { Settings } from '../defaultSettings';
import { BasicLayoutProps } from 'src/BasicLayout';

interface FormatterProps {
  data: MenuDataItem[];
  menu: Settings['menu'];
  formatMessage?: (data: { id: string; defaultMessage?: string }) => string;
  parentName?: string;
  authority?: string[] | string;
}
// Conversion router to menu.
function formatter(props: FormatterProps): MenuDataItem[] {
  const { data, menu, formatMessage, authority, parentName } = props;
  return data
    .filter(item => item && item.name && item.path)
    .map(item => {
      const locale = `${parentName || 'menu'}.${item.name!}`;
      // if enableMenuLocale use item.name,
      // close menu international
      const name =
        menu.locale || !formatMessage
          ? item.name!
          : formatMessage({ id: locale, defaultMessage: item.name! });
      const result: MenuDataItem = {
        ...item,
        name,
        locale,
        routes: void 0,
      };
      if (item.routes) {
        const children = formatter({
          ...props,
          authority: item.authority || authority,
          data: item.routes,
          parentName: locale,
        });
        // Reduce memory usage
        result.children = children;
      }
      return result;
    });
}

const memoizeOneFormatter = memoizeOne(formatter, isEqual);

/**
 * get SubMenu or Item
 */
const getSubMenu: (item: MenuDataItem) => MenuDataItem = item => {
  if (
    item.children &&
    Array.isArray(item.children) &&
    !item.hideChildrenInMenu &&
    item.children.some(child => (child.name ? true : false))
  ) {
    const children = defaultFilterMenuData(item.children);
    if (children.length) return { ...item, children };
  }
  return { ...item, children: void 0 };
};

/**
 * filter menuData
 */
const defaultFilterMenuData = (
  menuData: MenuDataItem[] = [],
): MenuDataItem[] => {
  return menuData
    .filter(item => item && item.name && !item.hideInMenu)
    .map(item => getSubMenu(item))
    .filter(item => item);
};

/**
 * 获取面包屑映射
 * @param MenuDataItem[] menuData 菜单配置
 */
const getBreadcrumbNameMap = (menuData: MenuDataItem[]) => {
  const routerMap: { [key: string]: MenuDataItem } = {};
  const flattenMenuData: (data: MenuDataItem[]) => void = data => {
    data.forEach(menuItem => {
      if (!menuItem) {
        return;
      }
      if (menuItem && menuItem.children) {
        flattenMenuData(menuItem.children);
      }
      // Reduce memory usage
      routerMap[menuItem.path] = menuItem;
    });
  };
  flattenMenuData(menuData);
  return routerMap;
};

const memoizeOneGetBreadcrumbNameMap = memoizeOne(
  getBreadcrumbNameMap,
  isEqual,
);

export default (routes: Route[], props: BasicLayoutProps) => {
  const { formatMessage, menu, menuDataRender } = props;
  let originalMenuData = memoizeOneFormatter({
    data: routes,
    formatMessage,
    menu: menu || {
      locale: false,
    },
  });
  if (menuDataRender) {
    originalMenuData = menuDataRender(originalMenuData);
  }
  const menuData = defaultFilterMenuData(originalMenuData);
  const breadcrumb = memoizeOneGetBreadcrumbNameMap(originalMenuData);
  return { breadcrumb, menuData };
};
