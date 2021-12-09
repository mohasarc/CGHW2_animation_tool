import { useState } from 'react';
import { Card, CardHeader, CardContent, Divider, Slider } from '@mui/material';
import { StateManager } from '../util/StateManager';

export default function MotionControls() {
    const [slider2, setSlider2] = useState(0);
    const [slider3, setSlider3] = useState(0);
    const [slider4, setSlider4] = useState(0);
    const [slider2Limit, setSlider2Limit] = useState({min: -180, max: 180});
    const [slider3Limit, setSlider3Limit] = useState({min: -180, max: 180});
    const [slider4Limit, setSlider4Limit] = useState({min: -180, max: 180});

    StateManager.getInstance().subscribe('slider-2', () => {
        setSlider2(StateManager.getInstance().getState('slider-2'));
    });

    StateManager.getInstance().subscribe('slider-3', () => {
        setSlider3(StateManager.getInstance().getState('slider-3'));
    });

    StateManager.getInstance().subscribe('slider-4', () => {
        setSlider4(StateManager.getInstance().getState('slider-4'));
    });

    StateManager.getInstance().subscribe('limits', () => {
        const limits = StateManager.getInstance().getState('limits');

        if (limits !== undefined && limits.thetaX !== undefined) {
            setSlider2Limit(limits.thetaX);
        } else {
            setSlider2Limit({min: -180, max: 180})
        }

        if (limits !== undefined && limits.thetaY !== undefined) {
            setSlider3Limit(limits.thetaY);
        } else {
            setSlider3Limit({min: -180, max: 180})
        }

        if (limits !== undefined && limits.thetaZ !== undefined) {
            setSlider4Limit(limits.thetaZ);
        } else {
            setSlider4Limit({min: -180, max: 180})
        }
    });

    function handleSlider2Change(newSize: number) {
        StateManager.getInstance().setState('slider-2', newSize);
    }

    function handleSlider3Change(newSize: number) {
        StateManager.getInstance().setState('slider-3', newSize);
    }
    function handleSlider4Change(newSize: number) {
        StateManager.getInstance().setState('slider-4', newSize);
    }
    return (
        <Card>
            <CardHeader title={'Motion Controls'} titleTypographyProps={{ variant: 'body2', align: 'center', color: 'common.white' }} style={{ backgroundColor: '#323638' }} />
            <CardContent style={{ backgroundColor: '#3b4245' }}>
                <Slider
                    size="small"
                    value={slider2}
                    min={slider2Limit.min}
                    max={slider2Limit.max}
                    aria-label="Small"
                    valueLabelDisplay="auto"
                    onChange={(event: any) => { handleSlider2Change(event.target.value) }}
                />
                <Divider />
                <Slider
                    size="small"
                    value={slider3}
                    min={slider3Limit.min}
                    max={slider3Limit.max}
                    aria-label="Small"
                    valueLabelDisplay="auto"
                    onChange={(event: any) => { handleSlider3Change(event.target.value) }}
                />
                <Divider />
                <Slider
                    size="small"
                    value={slider4}
                    min={slider4Limit.min}
                    max={slider4Limit.max}
                    aria-label="Small"
                    valueLabelDisplay="auto"
                    onChange={(event: any) => { handleSlider4Change(event.target.value) }}
                />
            </CardContent>
        </Card>
    );
}