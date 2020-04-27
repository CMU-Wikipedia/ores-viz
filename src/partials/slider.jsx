import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles, makeStyles} from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';

class ThresholdeSlider extends Component {
  constructor (props) {
    super (props);
  }
  state = {};
  render () {
    // const classes = useStyles ();

    return (
      <PrettoSlider
        valueLabelDisplay="auto"
        aria-label="pretto slider"
        defaultValue={50}
        onChangeCommitted={this.props.onChangeCommitted}
      />
    );
  }
}

export default ThresholdeSlider;

const useStyles = makeStyles (theme => ({
  root: {
    width: 300 + theme.spacing (3) * 2,
  },
  margin: {
    height: theme.spacing (3),
  },
}));

const PrettoSlider = withStyles ({
  root: {
    color: '#C57619',
    height: 10,
    paddingTop: '50px',
    paddingBottom: '0px',
  },
  thumb: {
    height: 18,
    width: 18,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -9,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50%+12px)',
  },
  track: {
    height: 4,
    borderRadius: 4,
    color: '#909090',
  },
  rail: {
    height: 4,
    borderRadius: 4,
    color: '#C57619',
    opacity: '100%',
  },
}) (Slider);
