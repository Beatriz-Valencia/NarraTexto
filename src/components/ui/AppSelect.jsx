import { Select } from 'antd';
export default function AppSelect({ options = [], ...props }) {
  return <Select options={options} {...props} />;
}