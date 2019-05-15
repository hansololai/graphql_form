import React from 'react';
import { Upload, Button, Icon, Row } from 'antd';
import InputWrapper from './input_wrapper';


class UploadWithLink extends React.Component {
  render() {
    const { fileUrl, fileName, value } = this.props;
    const fileList = [];
    if (value instanceof File) {
      fileList.push(value);
    }
    return (
      <div>
        {fileUrl && fileName && <Row>
          <a href={fileUrl} >{fileName}</a>
        </Row>}
        <Upload name="logo" listType="picture" beforeUpload={() => false} {...this.props} fileList={fileList}>
          <Button>
            <Icon type="upload" /> Click to upload
          </Button>
        </Upload></div>);
  }
}
const FileInput = (props) => {
  const options = {
    getValueFromEvent: (e) => {
      console.log('Upload event:', e);
      if (Array.isArray(e)) {
        return e;
      }
      return e && e.file;
    },
  };
  const { fileUrl, fileName } = props;
  return (
    <InputWrapper {...props} options={options} >
      <UploadWithLink fileUrl={fileUrl} fileName={fileName} />
    </InputWrapper>);
};
export default FileInput;
