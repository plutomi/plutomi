import { Col } from "antd";

type PageContainerProps = {
  children: React.ReactNode;
};

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => (
  <Col span={24} style={{ minHeight: "100%", wordBreak: "break-all" }}>
    {children}
  </Col>
);
