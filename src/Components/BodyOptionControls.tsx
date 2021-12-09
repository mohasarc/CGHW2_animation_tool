import { useState } from 'react';
import { Card, CardHeader, CardContent, Divider, Slider , FormControl, FormLabel, RadioGroup, FormControlLabel, Radio} from '@mui/material';
import { StateManager } from '../util/StateManager';
import { HierarchicalModel } from './AnimArea';

/**
 * 
 */
function traverseModelExtractTitles( theTitles: string[], model: HierarchicalModel ) {
    if (model.values.anim) theTitles.push(model.name);

    model.children?.forEach((child) => {
        traverseModelExtractTitles(theTitles, child);
    });
}

export default function MotionControls() {
    const theTitles: string[] = [];
    traverseModelExtractTitles(theTitles, StateManager.getInstance().getState('model'))
    const [titles, setTitles] = useState<string[]>(theTitles);
    const [value, setValue] = useState("head");

    StateManager.getInstance().subscribe('model', () => {
        const theTitles: string[] = [];
        traverseModelExtractTitles(theTitles, StateManager.getInstance().getState('model'));
        setTitles(theTitles);
    });

    StateManager.getInstance().subscribe('buttons', () => {
        setValue(StateManager.getInstance().getState('buttons'));
    });

    function handleChange(bodyPart: string) {
        StateManager.getInstance().setState('buttons', bodyPart);
        let theLimits;
        let slider2Val;
        let slider3Val;
        let slider4Val;

        function getLimits(model: HierarchicalModel, name: string) {
            if (model.name === name) {
                theLimits = model.values.limits;
                slider2Val = model.values.thetaX[model.values.thetaX.length-1];
                slider3Val = model.values.thetaY[model.values.thetaY.length-1];
                slider4Val = model.values.thetaZ[model.values.thetaZ.length-1];
            }
    
            model.children?.forEach((child) => {
                getLimits(child, name);
            });
        }

        getLimits(StateManager.getInstance().getState('model'), bodyPart);
        StateManager.getInstance().setState('limits', theLimits)
        StateManager.getInstance().setState('slider-2', slider2Val);
        StateManager.getInstance().setState('slider-3', slider3Val);
        StateManager.getInstance().setState('slider-4', slider4Val);
    }

    return (
        <Card>
            <CardHeader title={'Body Parts'} titleTypographyProps={{ variant: 'body2', align: 'center', color: 'common.white' }} style={{ backgroundColor: '#323638' }} />
            <CardContent style={{ backgroundColor: '#3b4245' }}>
                <FormLabel component="legend"></FormLabel>
                    <RadioGroup
                        aria-label="gender"
                        defaultValue="head"
                        name="radio-buttons-group"
                        value={value}
                        onChange={(event: any) => { handleChange(event.target.value) }}
                    >
                    {titles.map((title) => {
                        return (
                            <FormControlLabel value={title} control={<Radio />} label={title} />
                        )
                    })}
                    </RadioGroup>
            </CardContent>
        </Card>
    );
}