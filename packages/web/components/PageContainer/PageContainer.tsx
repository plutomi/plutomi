import React from "react";
import { Layout, Row, Space } from "antd";
import { colors } from "@/utils";

const { Header, Footer, Sider, Content } = Layout;

const headerStyle: React.CSSProperties = {
  // textAlign: "center",
  // color: "#fff",
  backgroundColor: colors.background
};

const contentStyle: React.CSSProperties = {
  // textAlign: "center",
  backgroundColor: colors.background
  // border: "2px solid purple"

  // color: "#fff",
  // backgroundColor: "#108ee9"
};

// const siderStyle: React.CSSProperties = {
//   textAlign: "center",
//   lineHeight: "120px",
//   color: "#fff",
//   backgroundColor: "#3ba0e9"
// };

const footerStyle: React.CSSProperties = {
  backgroundColor: colors.background
  // border: "2px solid gold"
  // textAlign: "center",
  // color: "#fff",
  // backgroundColor: "#7dbcea"
};

type PageContainerProps = {
  children: React.ReactNode;
};

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => (
  <Layout
    style={{
      minHeight: "100vh"
    }}
  >
    <Header style={headerStyle} />
    <Content style={contentStyle}>{children}</Content>
    <Footer style={footerStyle} />
  </Layout>
);
