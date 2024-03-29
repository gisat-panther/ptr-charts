import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import _ from "lodash";

import "../style.scss";

import Context from "@gisatcz/cross-package-react-context";
const HoverContext = Context.getContext("HoverContext");

class Node extends React.PureComponent {
  static contextType = HoverContext;

  static propTypes = {
    defaultColor: PropTypes.string,
    highlightedColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    highlighted: PropTypes.bool,
    itemKeys: PropTypes.array,

    x0: PropTypes.number,
    x1: PropTypes.number,
    y0: PropTypes.number,
    y1: PropTypes.number,
    height: PropTypes.number,
    width: PropTypes.number,

    nameSourcePath: PropTypes.string,
    valueSourcePath: PropTypes.string,
    data: PropTypes.object,

    hoverNameSourcePath: PropTypes.string,
    hoverValueSourcePath: PropTypes.string,
    yOptions: PropTypes.object,
    maxNodeDepth: PropTypes.number,
  };

  constructor(props) {
    super(props);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);

    this.state = {
      color: props.defaultColor ? props.defaultColor : null,
      hidden: props.hidden,
    };
  }

  onMouseMove(e) {
    if (this.context && this.context.onHover) {
      this.context.onHover(this.props.itemKeys, {
        popup: {
          x: e.pageX,
          y: e.pageY,
          content: this.getPopupContent(),
        },
      });
    }

    let color = null;
    if (this.props.highlightedColor) {
      color = this.props.highlightedColor;
    }

    //set highlighted

    this.setState({
      color,
      hidden: false,
    });
  }

  onMouseOver(e) {
    if (this.context && this.context.onHover) {
      this.context.onHover(this.props.itemKeys, {
        popup: {
          x: e.pageX,
          y: e.pageY,
          content: this.getPopupContent(),
        },
      });
    }

    let color = null;
    if (this.props.highlightedColor) {
      color = this.props.highlightedColor;
    }

    this.setState({
      color,
      hidden: false,
    });
  }

  onMouseOut(e) {
    if (this.context && this.context.onHoverOut) {
      this.context.onHoverOut();
    }

    let color = null;
    if (this.props.defaultColor) {
      color = this.props.defaultColor;
    }

    this.setState({
      color,
      hidden: this.props.hidden,
    });
  }

  render() {
    const props = this.props;
    let style = {};
    let highlighted = false;

    if (this.context && this.context.hoveredItems) {
      highlighted = !!_.intersection(
        this.context.hoveredItems,
        this.props.itemKeys
      ).length;
    }

    let classes = classnames("ptr-sankey-chart-node", {
      "ptr-sankey-chart-node-highlighted": highlighted,
    });

    if (this.state.color) {
      style.fill = this.state.color;
      style.stroke = this.state.color;
    }

    const width = Math.abs(props.x1 - props.x0);
    const height = Math.abs(props.y1 - props.y0);

    const name =
      props.nameSourcePath && _.get(props.data, props.nameSourcePath);

    const textPadding = 2;
    const textAnchor =
      props.maxNodeDepth === props.data.depth ? "end" : "start";
    const textX =
      props.maxNodeDepth === props.data.depth
        ? props.x0 - textPadding
        : props.x1 + textPadding;
    return (
      <g
        onMouseOver={this.onMouseOver}
        onMouseMove={this.onMouseMove}
        onMouseOut={this.onMouseOut}
      >
        <rect
          key={this.props.itemKeys[0]}
          className={classes}
          x={props.x0}
          y={props.y0}
          height={height}
          width={width}
          style={style}
        />
        {name ? (
          <text
            y={(props.y1 + props.y0) / 2}
            dy={"0.35em"}
            x={textX}
            textAnchor={textAnchor}
            className={"ptr-sankey-chart-text"}
          >
            {name}
          </text>
        ) : null}
      </g>
    );
  }

  //TODO
  getPopupContent() {
    const props = this.props;
    let data = props.data;
    let content = null;
    let unit = null;
    let attributeName = null;

    if (data) {
      if (props.yOptions) {
        if (props.yOptions.name) {
          attributeName = `${props.yOptions.name}: `;
        }

        if (props.yOptions.unit) {
          unit = `${props.yOptions.unit}`;
        }
      }

      let defaultName = `${_.get(data, "id")}`;
      let name = defaultName;
      const nameSourcePath = _.get(data, this.props.nameSourcePath);
      if (this.props.nameSourcePath && nameSourcePath) {
        name = nameSourcePath;
      }

      const hoverNameSourcePath = _.get(data, this.props.hoverNameSourcePath);
      if (this.props.hoverNameSourcePath && hoverNameSourcePath) {
        name = hoverNameSourcePath;
      }

      let value = _.get(
        data,
        this.props.hoverValueSourcePath || this.props.valueSourcePath
      );
      content = (
        <div key={name}>
          <i>{name}:</i> {value && value.toLocaleString()} {unit}
        </div>
      );
    } else {
      content = (
        <div key={"no-data"}>
          <i>No data</i>
        </div>
      );
    }

    return (
      <>
        {attributeName ? (
          <div>
            <i>{attributeName}</i>
          </div>
        ) : null}
        {content}
      </>
    );
  }
}

export default Node;
