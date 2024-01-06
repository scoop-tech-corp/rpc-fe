import { useEffect, useState } from 'react';
import { defaultFormSecurityGroup, useFormSecurityGroupStore } from './form-security-group-store';
import { useParams } from 'react-router';
import { getSecurityGroupDetail, getSecurityGroupUser } from '../service';
import FormSecurityGroupBody from './form-security-group-body';
import FormSecurityGroupHeader from './form-security-group-header';
import { jsonCentralized } from 'utils/func';

const SecurityGroupForm = () => {
  let { id } = useParams();
  const [name, setName] = useState('');

  const getDropdownData = async () => {
    const getUser = await getSecurityGroupUser();
    useFormSecurityGroupStore.setState({ userList: getUser });
  };

  const getDetail = async () => {
    await getSecurityGroupDetail(id).then((resp) => {
      const getDetail = resp.data;
      setName(getDetail.roleName);

      useFormSecurityGroupStore.setState({
        role: getDetail.roleName,
        status: +getDetail.status,
        usersId: [],
        selectedUsers: getDetail.users.map((dt) => ({ ...dt, status: '' }))
      });
    });
  };

  const getData = async () => {
    await getDropdownData();
    if (id) getDetail();
  };

  useEffect(() => {
    getData();

    return () => {
      useFormSecurityGroupStore.setState(jsonCentralized(defaultFormSecurityGroup));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <FormSecurityGroupHeader securityGroupName={name} />
      <FormSecurityGroupBody />
    </>
  );
};

export default SecurityGroupForm;
