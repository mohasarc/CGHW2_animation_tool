import { useState } from 'react';
import { Card, CardHeader, CardContent, Divider, Slider , FormControl, FormLabel, RadioGroup, FormControlLabel, Radio} from '@mui/material';
import { StateManager } from '../util/StateManager';
import { HierarchicalModel } from './AnimArea';

/**
 * 
 */
function traverseModelExtractTitles( theTitles: string[], model: HierarchicalModel ) {
    theTitles.push(model.name);
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
                    {titles.map((title, i) => {
                        return (
                            <FormControlLabel value={title} control={<Radio />} label={title} />
                        )
                    })}
                    </RadioGroup>
            </CardContent>
        </Card>
    );
}