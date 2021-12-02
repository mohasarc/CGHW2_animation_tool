import { useState } from 'react';
import { Card, CardHeader, CardContent, Divider, Slider , FormControl, FormLabel, RadioGroup, FormControlLabel, Radio} from '@mui/material';
import { StateManager } from '../util/StateManager';

export default function MotionControls() {
    const [value, setValue] = useState("head");

    StateManager.getInstance().subscribe('buttons', () => {
        setValue(StateManager.getInstance().getState('buttons'));
    });

    function handleChange(bodyPart: number) {
        StateManager.getInstance().setState('buttons', bodyPart);
    }

    return (
        <Card>
            <CardHeader title={'Body Parts'} titleTypographyProps={{ variant: 'body2', align: 'center', color: 'common.white' }} style={{ backgroundColor: '#323638' }} />
            <CardContent style={{ backgroundColor: '#3b4245' }}>
                <FormLabel component="legend">Body Parts</FormLabel>
                    <RadioGroup
                    aria-label="gender"
                    defaultValue="head"
                    name="radio-buttons-group"
                    value={value}
                    onChange={(event: any) => { handleChange(event.target.value) }}

                    >
                    <FormControlLabel value={2} control={<Radio />} label="Head" />
                    <FormControlLabel value={1} control={<Radio />} label="Upper Body" />
                    <FormControlLabel value={3} control={<Radio />} label="Right Upper Arm" />
                    <FormControlLabel value={4} control={<Radio />} label="Right Lower Arm" />
                    <FormControlLabel value={5} control={<Radio />} label="Left Upper Arm" />
                    <FormControlLabel value={6} control={<Radio />} label="Left Lower Arm" />
                    <FormControlLabel value={7} control={<Radio />} label="Left Front Upper Leg" />
                    <FormControlLabel value={8} control={<Radio />} label="Left Front Lower Leg" />
                    <FormControlLabel value={9} control={<Radio />} label="Right Front Upper Leg" />
                    <FormControlLabel value={10} control={<Radio />} label="Right Front Lower Leg" />
                    <FormControlLabel value={11} control={<Radio />} label="Left Back Upper Leg" />
                    <FormControlLabel value={12} control={<Radio />} label="Left Back Lower Leg" />
                    <FormControlLabel value={13} control={<Radio />} label="Right Back Upper Leg" />
                    <FormControlLabel value={14} control={<Radio />} label="Right Back Lower Leg" />
                    </RadioGroup>
            </CardContent>
        </Card>
    );
}