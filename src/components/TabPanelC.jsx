import PropTypes from 'prop-types';

const TabPanel = (props) => {
  const { children, value, index, name } = props;
  const id = `${name}-tabpanel-${value}`; // staff-leave-tabpanel-${value}
  const aria = `${name}-tab-${value}`; // staff-leave-tab-${value}

  return (
    <div role="tabpanel" id={id} aria-labelledby={aria}>
      {value === index && <>{children}</>}
    </div>
  );
};
TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number,
  index: PropTypes.number,
  name: PropTypes.string
};

export default TabPanel;
