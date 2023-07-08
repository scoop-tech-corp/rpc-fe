import { useEffect } from 'react';
import { useFormSecurityGroupStore } from './form-security-group-store';
import { useParams } from 'react-router';
import { getSecurityGroupUser } from '../service';
import FormSecurityGroupBody from './form-security-group-body';
import FormSecurityGroupHeader from './form-security-group-header';

const SecurityGroupForm = () => {
  let { id } = useParams();

  const getDropdownData = async () => {
    const getUser = await getSecurityGroupUser();
    useFormSecurityGroupStore.setState({ userList: getUser });
  };

  const getDetail = () => {};

  const getData = async () => {
    await getDropdownData();
    if (id) getDetail();
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <FormSecurityGroupHeader />
      <FormSecurityGroupBody />
    </>
  );
};

export default SecurityGroupForm;
