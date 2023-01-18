import { useContext, useState } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import {
  get as _get,
  intersection as _intersection,
  indexOf as _indexOf,
} from "lodash";
import moment from "moment";

import Context from "@gisatcz/cross-package-react-context";
import "./style.scss";

const Point = ({
  color,
  r,
  itemKey,
  onMouseMove,
  data,
  standalone,
  xSourcePath,
  ySourcePath,
  zSourcePath,
  onMouseOver,
  siblings,
  highlighted,
  hidden,
  xOptions,
  yOptions,
  zOptions,
  symbol,
  x,
  y,
  onMouseOut,
  name,
  xScaleType,
}) => {
  const context = useContext(Context.getContext("HoverContext"));

  const [radius, setRadius] = useState(r);

  const onClick = () => {
    if (context && context.onClick) {
      context.onClick([itemKey]);
    }
  };

  const getPopupContent = () => {
    // const props = this.props;

    let style = {};
    let pointName = name;
    let xUnits = xOptions && xOptions.unit;
    let yUnits = yOptions && yOptions.unit;
    let zUnits = zOptions && zOptions.unit;

    let xName = (xOptions && xOptions.name) || "X value";
    let yName = (yOptions && yOptions.name) || "Y value";
    let zName = (zOptions && zOptions.name) || "Z value";

    let color = color;

    let xValue = _get(data, xSourcePath);
    let yValue = _get(data, ySourcePath);
    let zValue = _get(data, zSourcePath);

    let xValueString = xValue;
    if (xScaleType === "time") {
      let time = moment(xValueString);
      if (xOptions) {
        if (xOptions.timeValueLanguage) {
          time = time.locale(xOptions.timeValueLanguage);
        }

        if (xOptions.popupValueFormat) {
          time = time.format(xOptions.popupValueFormat);
        } else {
          time = time.format();
        }
      }
      xValueString = time;
    } else if (xValue && xValue % 1 !== 0) {
      xValueString = xValueString.toFixed(2);
    }

    let yValueString = yValue;
    if (yValue && yValue % 1 !== 0) {
      yValueString = yValueString.toFixed(2);
    }

    let zValueString = zValue;
    if (zValue && zValue % 1 !== 0) {
      zValueString = zValueString.toFixed(2);
    }

    if (color) {
      style.background = color;
    }

    return (
      <>
        <div className="ptr-popup-header">
          <div className="ptr-popup-record-color" style={style}></div>
          {pointName}
        </div>
        <div className="ptr-popup-record-group">
          <div className="ptr-popup-record">
            {<div className="ptr-popup-record-attribute">{xName}</div>}
            <div className="ptr-popup-record-value-group">
              {xValueString || xValueString === 0 ? (
                <span className="value">{xValueString.toLocaleString()}</span>
              ) : null}
              {xUnits ? <span className="unit">{xUnits}</span> : null}
            </div>
          </div>
        </div>
        <div className="ptr-popup-record-group">
          <div className="ptr-popup-record">
            {<div className="ptr-popup-record-attribute">{yName}</div>}
            <div className="ptr-popup-record-value-group">
              {yValueString || yValueString === 0 ? (
                <span className="value">{yValueString.toLocaleString()}</span>
              ) : null}
              {yUnits ? <span className="unit">{yUnits}</span> : null}
            </div>
          </div>
        </div>
        {zSourcePath ? (
          <div className="ptr-popup-record-group">
            <div className="ptr-popup-record">
              {<div className="ptr-popup-record-attribute">{zName}</div>}
              <div className="ptr-popup-record-value-group">
                {zValueString || zValueString === 0 ? (
                  <span className="value">{zValueString.toLocaleString()}</span>
                ) : null}
                {zUnits ? <span className="unit">{zUnits}</span> : null}
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  };

  const selfOnMouseMove = (e) => {
    if (onMouseMove) {
      onMouseMove(e, data);
    }
    if (standalone && context && context.onHover) {
      context.onHover([itemKey], {
        popup: {
          x: e.pageX,
          y: e.pageY,
          content: getPopupContent(),
        },
      });
    }

    if (!zSourcePath) {
      setRadius(r + 3);
    }
  };

  const selfOnMouseOver = (e) => {
    if (onMouseOver) {
      onMouseOver(e, data);
    }
    if (standalone && context && context.onHover) {
      context.onHover([itemKey], {
        popup: {
          x: e.pageX,
          y: e.pageY,
          content: getPopupContent(),
        },
      });
    }

    if (!zSourcePath) {
      setRadius(r + 3);
    }
  };

  const selfOnMouseOut = (e) => {
    if (onMouseOut) {
      onMouseOut();
    }

    if (standalone && context && context.onHoverOut) {
      context.onHoverOut();
    }

    setRadius(r);
  };

  const renderPlusSymbol = (key, x, y, classes, style) => {
    classes += " path";

    let pathStyle = {};
    if (color) {
      pathStyle.stroke = color;
    }

    return (
      <g
        key={key}
        style={style}
        className={classes}
        onMouseOver={selfOnMouseOver}
        onMouseMove={selfOnMouseMove}
        onMouseOut={selfOnMouseOut}
        onClick={onClick}
        width={2 * radius}
        height={2 * radius}
      >
        <circle style={{ opacity: 0 }} cx={x} cy={y} r={radius} />
        <path
          style={pathStyle}
          d={`M${x},${y - radius} L${x},${y + radius} M${x - radius},${y} L${
            x + radius
          },${y}`}
        />
      </g>
    );
  };

  // const props = this.props;
  let suppressed = false;

  /* Handle context */
  if (
    context &&
    (context.hoveredItems || context.selectedItems) &&
    itemKey &&
    siblings
  ) {
    let hoverIntersection = _intersection(context.hoveredItems, siblings);
    let selectIntersection = _intersection(context.selectedItems, siblings);
    let isHovered = _indexOf(hoverIntersection, itemKey);
    let isSelected = _indexOf(selectIntersection, itemKey);

    if (
      (!!hoverIntersection.length || !!selectIntersection.length) &&
      isHovered === -1 &&
      isSelected === -1
    ) {
      suppressed = true;
    }
  }

  let classes = classnames("ptr-chart-point", {
    "no-opacity": highlighted,
    standalone: standalone,
  });

  let style = {};
  if (color) {
    style.fill = color;
  }
  if (suppressed) {
    style.opacity = 0.25;
  } else if (!hidden) {
    style.opacity = 1;
  }

  if (zOptions && zOptions.showOnHover) {
    if (highlighted) {
      style.opacity = 1;
    } else {
      style.opacity = 0;
    }
  }

  if (symbol === "plus") {
    return renderPlusSymbol(itemKey, x, y, classes, style);
  } else {
    return (
      <circle
        onMouseOver={selfOnMouseOver}
        onMouseMove={selfOnMouseMove}
        onMouseOut={selfOnMouseOut}
        onClick={onClick}
        className={classes}
        key={itemKey}
        cx={x}
        cy={y}
        r={radius}
        style={style}
      />
    );
  }
};

Point.propTypes = {
  itemKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  data: PropTypes.object,
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  x: PropTypes.number,
  y: PropTypes.number,
  r: PropTypes.number,
  onMouseMove: PropTypes.func,
  onMouseOut: PropTypes.func,
  onMouseOver: PropTypes.func,
  color: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  highlighted: PropTypes.bool,

  xScaleType: PropTypes.string,

  xSourcePath: PropTypes.string,
  ySourcePath: PropTypes.string,
  zSourcePath: PropTypes.string,
  xOptions: PropTypes.object,
  yOptions: PropTypes.object,
  zOptions: PropTypes.object,

  standalone: PropTypes.bool,
  siblings: PropTypes.array,
  symbol: PropTypes.string,
  hidden: PropTypes.bool,
};

export default Point;
