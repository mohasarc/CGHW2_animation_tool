import { useState } from 'react';
import { Card, CardHeader, CardContent, Divider, Slider } from '@mui/material';
import { StateManager } from '../util/StateManager';

export default function MotionControls() {
    const [slider1, setSlider1] = useState(0);
    const [slider2, setSlider2] = useState(0);
    const [slider3, setSlider3] = useState(0);
    const [slider4, setSlider4] = useState(0);

    StateManager.getInstance().subscribe('slider-1', () => {
        setSlider1(StateManager.getInstance().getState('slider-1'));
    });

    StateManager.getInstance().subscribe('slider-2', () => {
        setSlider2(StateManager.getInstance().getState('slider-2'));
    });

    StateManager.getInstance().subscribe('slider-3', () => {
        setSlider3(StateManager.getInstance().getState('slider-3'));
    });

    StateManager.getInstance().subscribe('slider-4', () => {
        setSlider4(StateManager.getInstance().getState('slider-4'));
    });

    function handleSlider1Change(newSize: number) {
        StateManager.getInstance().setState('slider-1', newSize);
    }

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
                    value={slider1}
                    min={2}
                    aria-label="Small"
                    valueLabelDisplay="auto"
                    onChange={(event: any) => { handleSlider1Change(event.target.value) }}
                />
                <Divider />
                <Slider
                    size="small"
                    value={slider2}
                    min={2}
                    aria-label="Small"
                    valueLabelDisplay="auto"
                    onChange={(event: any) => { handleSlider2Change(event.target.value) }}
                />
                <Divider />
                <Slider
                    size="small"
                    value={slider3}
                    min={2}
                    aria-label="Small"
                    valueLabelDisplay="auto"
                    onChange={(event: any) => { handleSlider3Change(event.target.value) }}
                />
                <Divider />
                <Slider
                    size="small"
                    value={slider4}
                    min={2}
                    aria-label="Small"
                    valueLabelDisplay="auto"
                    onChange={(event: any) => { handleSlider4Change(event.target.value) }}
                />
            </CardContent>
        </Card>
    );
}