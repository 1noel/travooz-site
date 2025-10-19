const defaultSettings = {
  category: "restStay",
  show: true,
};

const ROUTE_FILTER_RULES = [
  {
    test: (path) => path.startsWith("/register"),
    category: "default",
    show: false,
  },
  {
    test: (path) => path.startsWith("/sign-in"),
    category: "default",
    show: false,
  },
  {
    test: (path) => path.startsWith("/cart"),
    category: "default",
    show: false,
  },
  {
    test: (path) => path.startsWith("/hotel/"),
    category: "restStay",
    show: false,
  },
  {
    test: (path) => path.startsWith("/hotels"),
    category: "restStay",
    show: true,
  },
  {
    test: (path) => path.startsWith("/car/"),
    category: "carRental",
    show: false,
  },
  {
    test: (path) => path.startsWith("/cars"),
    category: "carRental",
    show: true,
  },
  {
    test: (path) => path.startsWith("/restaurant/"),
    category: "eatingOut",
    show: false,
  },
  {
    test: (path) => path.startsWith("/eating-out"),
    category: "eatingOut",
    show: true,
  },
  {
    test: (path) => path.startsWith("/activities"),
    category: "activities",
    show: true,
  },
  {
    test: (path) => path.startsWith("/tour-package/"),
    category: "tourPackages",
    show: false,
  },
  {
    test: (path) => path.startsWith("/tour-packages"),
    category: "tourPackages",
    show: true,
  },
  {
    test: (path) => path.startsWith("/blogs"),
    category: "default",
    show: false,
  },
  {
    test: (path) => path.startsWith("/blog/"),
    category: "default",
    show: false,
  },
  {
    test: (path) => path === "/",
    category: "restStay",
    show: true,
  },
];

export const getFilterSettingsForPath = (pathname) => {
  const rule = ROUTE_FILTER_RULES.find((item) => item.test(pathname));
  if (rule) {
    return {
      category: rule.category ?? defaultSettings.category,
      show: rule.show ?? defaultSettings.show,
    };
  }
  return { ...defaultSettings };
};

export const FILTER_DEFAULT_SETTINGS = defaultSettings;
