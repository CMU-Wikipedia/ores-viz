import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles, makeStyles} from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';

class ThresholdeSlider extends Component {
  constructor (props) {
    super (props);
    this.getText = this.getText.bind (this);
  }

  getText = value => {
    return `${value}%`;
  };

  state = {};
  render () {
    // const classes = useStyles ();

    return (
      <div style={{position: 'relative', marginTop: '5px'}}>
        <div style={{position: 'absolute', width: '100%', top: '10px'}}>
          <div>
            <div
              style={{width: '50%', display: 'inline-block', textAlign: 'left'}}
            >
              <Typography style={{fontWeight: 'bold'}}>
                {[<span>&#9664;</span>, ' Identify More']}
              </Typography>
            </div>
            <div
              style={{
                width: '50%',
                display: 'inline-block',
                textAlign: 'right',
              }}
            >
              <Typography style={{fontWeight: 'bold'}}>
                {['Identify Less ', <span>&#9654;</span>]}
              </Typography>
            </div>
          </div>

        </div>
        <div>
          {this.props.color === 'orange'
            ? <OrangeSlider
                valueLabelDisplay="auto"
                valueLabelFormat={this.getText}
                aria-label="pretto slider"
                defaultValue={this.props.defaultValue}
                onChangeCommitted={this.props.onChangeCommitted}
              />
            : <BlackSlider
                valueLabelDisplay="auto"
                valueLabelFormat={this.getText}
                aria-label="pretto slider"
                defaultValue={this.props.defaultValue}
                onChangeCommitted={this.props.onChangeCommitted}
              />}
        </div>
      </div>
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

const OrangeSlider = withStyles ({
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
    fontWeight: 'bold',
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

const BlackSlider = withStyles ({
  root: {
    color: '#000000',
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
    fontWeight: 'bold',
  },
  track: {
    height: 4,
    borderRadius: 4,
    color: '#909090',
  },
  rail: {
    height: 4,
    borderRadius: 4,
    color: '#000000',
    opacity: '100%',
  },
}) (Slider);
