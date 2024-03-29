import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import _ from "lodash";
import moment from "moment";

import "../style.scss";
import Point from "../Point";

import Context from "@gisatcz/cross-package-react-context";

class Line extends React.PureComponent {
  static contextType = Context.getContext("HoverContext");

  static propTypes = {
    itemKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    coordinates: PropTypes.array,
    defaultColor: PropTypes.string,
    highlightColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    highlighted: PropTypes.bool,
    withPoints: PropTypes.bool,
    pointOptions: PropTypes.object,
    siblings: PropTypes.array,
    suppressed: PropTypes.bool,
    gray: PropTypes.bool,

    pointNameSourcePath: PropTypes.string,
    pointValueSourcePath: PropTypes.string,
    yOptions: PropTypes.object,
    xScaleType: PropTypes.string,
    xOptions: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.ref = React.createRef();

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onClick = this.onClick.bind(this);

    this.state = {
      color: !props.gray && props.defaultColor ? props.defaultColor : null,
      length: null,
    };
  }

  onClick() {
    if (this.context && this.context.onClick) {
      this.context.onClick([this.props.itemKey]);
    }
  }

  onMouseMove(e, data) {
    if (this.context && this.context.onHover) {
      this.context.onHover([this.props.itemKey], {
        popup: {
          x: e.pageX,
          y: e.pageY,
          content: this.getPopupContent(data),
          data: { ...this.props, ...data },
        },
      });
    }

    this.setColor(true);
  }

  onMouseOver(e, data) {
    if (this.context && this.context.onHover) {
      this.context.onHover([this.props.itemKey], {
        popup: {
          x: e.pageX,
          y: e.pageY,
          content: this.getPopupContent(data),
          data: { ...this.props, ...data },
        },
      });
    }

    this.setColor(true);
  }

  onMouseOut(e) {
    if (this.context && this.context.onHoverOut) {
      this.context.onHoverOut();
    }

    this.setColor();
  }

  componentDidMount() {
    this.updateLength();
    this.setColor();
  }

  componentDidUpdate(prevProps) {
    this.updateLength();

    if (
      prevProps.gray !== this.props.gray ||
      prevProps.highlighted !== this.props.highlighted ||
      prevProps.suppressed !== this.props.suppressed
    ) {
      this.setColor();
    }
  }

  updateLength() {
    let length = this.ref.current.getTotalLength();
    if (length !== this.state.length) {
      this.setState({ length });
    }
  }

  setColor(forceHover) {
    if (this.props.highlighted || forceHover) {
      this.setState({
        color: this.props.highlightColor ? this.props.highlightColor : null,
      });
    } else if (this.props.gray) {
      this.setState({ color: null });
    } else {
      this.setState({
        color: this.props.defaultColor ? this.props.defaultColor : null,
      });
    }
  }

  render() {
    const props = this.props;

    let color = this.state.color;
    let suppressed = this.props.suppressed;
    let highlighted = this.props.highlighted;

    /* Handle context */
    if (
      this.context &&
      (this.context.hoveredItems || this.context.selectedItems)
    ) {
      let isHovered = _.includes(this.context.hoveredItems, this.props.itemKey);
      let isSelected = _.includes(
        this.context.selectedItems,
        this.props.itemKey
      );
      highlighted = isHovered || isSelected;

      if (
        !this.props.gray &&
        this.props.siblings &&
        (!!_.intersection(this.context.hoveredItems, this.props.siblings)
          .length ||
          !!_.intersection(this.context.selectedItems, this.props.siblings)
            .length)
      ) {
        suppressed = !highlighted;
      }

      if (isHovered || isSelected) {
        color = this.props.highlightColor ? this.props.highlightColor : null;
      }
    }
    let classes = classnames("ptr-line-chart-line-wrapper", {
      gray: this.props.gray,
      highlighted,
    });

    return (
      <g
        className={classes}
        id={props.itemKey}
        style={{
          opacity: suppressed ? 0.15 : 1,
        }}
      >
        <path
          onClick={this.onClick}
          onMouseOver={this.onMouseOver}
          onMouseMove={this.onMouseMove}
          onMouseOut={this.onMouseOut}
          ref={this.ref}
          className={"ptr-line-chart-line"}
          key={props.itemKey}
          d={`M${props.coordinates
            .map((point) => {
              return `${point.x} ${point.y}`;
            })
            .join(" L")}`}
          style={{
            stroke: color,
            strokeDasharray: this.state.length,
            strokeDashoffset: this.state.length,
          }}
        />
        {props.withPoints ? this.renderPoints(color, highlighted) : null}
      </g>
    );
  }

  renderPoints(color, highlighted) {
    const props = this.props;
    const options = props.pointOptions;

    return props.coordinates.map((point) => {
      return (
        <Point
          itemKey={props.itemKey}
          key={point.x + "-" + point.y}
          x={point.x}
          y={point.y}
          data={point.originalData}
          r={(options && options.radius) || 5}
          color={color}
          hidden={this.props.gray}
          zOptions={{
            showOnHover: options && options.showOnHover,
          }}
          highlighted={highlighted}
          onMouseOver={this.onMouseOver}
          onMouseMove={this.onMouseMove}
          onMouseOut={this.onMouseOut}
        />
      );
    });
  }

  getPopupContent(data) {
    const props = this.props;

    let style = {};
    let lineName = props.name;
    let units = props.yOptions && props.yOptions.unit;
    let color = this.state.color || this.props.defaultColor;

    let pointName = data && _.get(data, props.pointNameSourcePath);
    let pointValue = data && _.get(data, props.pointValueSourcePath);
    if (pointName && props.xScaleType !== "time") {
      lineName += ` (${pointName})`;
    }

    if (color) {
      style.background = color;
    }

    return (
      <>
        <div className="ptr-popup-header">
          <div className="ptr-popup-record-color" style={style}></div>
          {lineName}
        </div>
        <div className="ptr-popup-record-group">
          {pointValue || pointValue === 0 ? (
            <div className="ptr-popup-record">
              {props.xScaleType === "time" ? (
                this.renderPopupContentWithTime(pointName, pointValue, units)
              ) : (
                <div className="ptr-popup-record-value-group">
                  {<span className="value">{pointValue.toLocaleString()}</span>}
                  {units ? <span className="unit">{units}</span> : null}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </>
    );
  }

  renderPopupContentWithTime(timeString, pointValue, units) {
    const props = this.props;
    let time = timeString;

    if (props.xOptions) {
      if (props.xOptions.inputValueFormat) {
        timeString = moment(
          timeString,
          props.xOptions.inputValueFormat
        ).toDate();
      }

      if (props.xScaleType === "time") {
        let momentTime = moment(timeString);
        if (props.xOptions.timeValueLanguage) {
          momentTime = momentTime.locale(props.xOptions.timeValueLanguage);
        }

        if (props.xOptions.popupValueFormat) {
          momentTime = momentTime.format(props.xOptions.popupValueFormat);
        } else {
          momentTime = momentTime.format();
        }
        time = momentTime;
      }
    }

    return (
      <div className="ptr-popup-record-group">
        <div className="ptr-popup-record">
          {<div className="ptr-popup-record-attribute">{time}</div>}
          <div className="ptr-popup-record-value-group">
            {<span className="value">{pointValue.toLocaleString()}</span>}
            {units ? <span className="unit">{units}</span> : null}
          </div>
        </div>
      </div>
    );
  }
}

export default Line;
