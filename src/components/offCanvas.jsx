import React, { useEffect, useState } from 'react';

const OffCanvas = (props) => {
  const { children, title, isOpen } = props;
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    setShow(isOpen);
  }, [isOpen]);

  const toggleOffCanvas = () => {
    setShow(!show);
  };
  return (
    <div className={`offcanvas-container ${!show && 'hidden'}`}>
      <div className={`offcanvas offcanvas-first offcanvas-start ${show ? 'show' : ''}`} tabIndex="-1" aria-labelledby={`${title}Label`}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id={`${title}Label`}>
            {title}
          </h5>
        </div>
        <div className="offcanvas-body">{children}</div>
      </div>
    </div>
  );
};

export default OffCanvas;
