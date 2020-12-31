import React from "react";
import * as PropType from "prop-types";
import useConfig from "../hooks/useConfig";

const PropertiesTray = ({ buttonIndex }) => {
  const [config, setConfig] = useConfig();

  const buttonProps = config.buttons?.find(butt => butt?.index === buttonIndex);

  return (
    <div>
      <div className="form-floating mb-3">
        <input type="email" className="form-control" id="floatingInput1" placeholder="name@example.com" />
        <label htmlFor="floatingInput1">Email address</label>
      </div>
      <div className="form-floating mb-3">
        <input type="email" className="form-control" id="floatingInput2" placeholder="name@example.com" />
        <label htmlFor="floatingInput2">Email address</label>
      </div>
      <div className="form-floating mb-3">
        <input type="email" className="form-control" id="floatingInput3" placeholder="name@example.com" />
        <label htmlFor="floatingInput3">Email address</label>
      </div>
    </div>
  );
};

PropertiesTray.propTypes = {
  buttonIndex: PropType.number,
};

PropertiesTray.defaultProps = {
  buttonIndex: null,
};

export default PropertiesTray;
