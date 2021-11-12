import { useState, useRef } from "react";
import { Container, Form, Row, Col, Button } from "react-bootstrap";

const createKeyGen = () => {
    const initVal = Date.now();

    return (id: number, idx: number) => {
        if (id > 0) { return id.toString(); }

        return (idx + initVal).toString();
    }
}

type KeyGenerator = (id: number, idx: number) => string;

function withKeyGen<T>(source?: any[]) {

    const keyGenerator = createKeyGen();

    return (extMap: (it: any, ix: number, k: KeyGenerator) => T) => {
        return (source??[]).map((item, idx) => {
            return extMap(item, idx, keyGenerator);
        });
    }
}

interface PrescriptionItemModel {
    key?: number;
    id: number;
    numOfFractions: number;
    dosePerFraction: number;
    targetVolume: string;
}

interface PrescriptionItemProps {
    data: PrescriptionItemModel
    isBoost?: boolean
    canEditDose: boolean
    canDelete: boolean
    onDelete?: () => void
    onFractionsChange?: (frNum: number) => void
};

const PrescriptionItem = (props: PrescriptionItemProps) => {

    const { data, isBoost } = props;
    
    const btnRef = useRef<HTMLButtonElement>(null);
    const [dosePerFrac, setDosePerFrac] = useState<number>(data.dosePerFraction);


    const dataProps = props.isBoost
        ? { value: data.numOfFractions }
        : { defaultValue: data.numOfFractions };


    return (
        <Container>
            <Row className="align-items-end">
                <Col>
                    <Form.Group>
                        { !isBoost && <Form.Label>Num Frac</Form.Label> }
                        <Form.Control
                            { ... dataProps }
                            readOnly={props.isBoost}
                            plaintext={props.isBoost}
                            style={{textAlign: 'right'}}
                            onChange={ e => props.onFractionsChange && props.onFractionsChange(Number(e.target.value)) }
                        />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>
                        { !isBoost && <Form.Label/> }
                        <Form.Control
                            readOnly
                            plaintext
                            disabled
                            value={"×"}
                        />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>
                        { !isBoost && <Form.Label>Dose/Fraction</Form.Label>}
                        <Form.Control
                            readOnly={!props.canEditDose}
                            plaintext={!props.canEditDose}
                            defaultValue={data.dosePerFraction}
                            style={{textAlign: 'right'}}
                            onChange={ e => {                                
                                data.dosePerFraction = (Number(e.target.value));
                                setDosePerFrac(Number(e.target.value));
                            }}
                        />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>
                        { !isBoost && <Form.Label/>}
                        <Form.Control
                            readOnly
                            plaintext
                            disabled
                            defaultValue={"="}
                        />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>
                        { !isBoost && <Form.Label>Total</Form.Label>}
                        <Form.Control
                            readOnly
                            plaintext
                            disabled
                            style={{textAlign: 'right'}}
                            value={ (data.numOfFractions * dosePerFrac).toFixed(2) }
                        />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>
                        { !isBoost && <Form.Label>Target</Form.Label>}
                        <Form.Control
                            readOnly={!props.canEditDose}                                                        
                            defaultValue={data.targetVolume}
                            onChange={ e => data.targetVolume = e.target.value }
                        />
                    </Form.Group>
                </Col>
                <Col>
                    { props.canDelete &&
                        <Button
                            className={"mb-3"}
                            ref={btnRef}
                            disabled={!props.canDelete}
                            onClick={e => {props.onDelete && props.onDelete() }}
                            onMouseUp={ e => btnRef.current?.blur() }                        
                        >
                            Delete
                        </Button>
                    }
                </Col>
            </Row>
        </Container>
    );
}

interface PrescriptionModel {
    items: PrescriptionItemModel[],
    canEditDose: boolean
};

interface PrescriptionProps {
    data: PrescriptionModel
};

function useList<S>(source: S[]) {

    const [items, setItems] = useState(source);

    const removeItem = (idx: number) => {
        if (idx === 0) { return; }

        setItems(
            items.filter((_, i) => i !== idx)
        );
    };

    const addItem = (newItem: S) => {
        setItems([...items, newItem]);
    };

    return { items, setItems, removeItem, addItem }
}

const Prescription = (props: PrescriptionProps) => {

    /*
    Taken out to a new hook
    const [items, setItems] = useState(props.data.items);

    const removeItem = (idx: number) => {
        if (idx === 0) { return; }

        setItems(
            items.filter((_, i) => i !== idx)
        );
    };

    const addItem = () => {
        const newItem = {
            id: 0,
            numOfFractions: items[0].numOfFractions,
            dosePerFraction: 0
        }
        setItems([...items, newItem]);
    };
    */

    const { items, setItems, removeItem, addItem } = useList(props.data.items);

    const updateFractionNumber = (frNum: number) => {
        const newItems = items.map(item => ({...item, numOfFractions: frNum}));
        setItems(newItems);
    }

    const createKey = createKeyGen();

    return(
        <Container className="p-3">
            {false && items && items.map((item, idx) => {
                const key = createKey(item.id, idx);
                return (
                    <PrescriptionItem
                        key={key}
                        data={item}
                        isBoost={idx > 0}
                        canDelete={idx > 0}
                        canEditDose={props.data.canEditDose}                        
                        onDelete={ () => removeItem(idx) }
                        onFractionsChange={(frNum) => updateFractionNumber(frNum)}
                    />)
            })}

            {withKeyGen(items)((item, idx, generateKey) => {
                return (
                    <PrescriptionItem
                        key={generateKey(item.id, idx)}
                        data={item}
                        isBoost={idx > 0}
                        canDelete={idx > 0}
                        canEditDose={props.data.canEditDose}                        
                        onDelete={ () => removeItem(idx) }
                        onFractionsChange={(frNum) => updateFractionNumber(frNum)}
                    />)
            })}
            
            <Button
                onClick={ (e) => addItem({
                    id: 0,
                    numOfFractions: items[0].numOfFractions,
                    dosePerFraction: 0,
                    targetVolume: ""
                })}
            >
                More boost
            </Button>
        </Container>    
    );
}

const initialPrescription = [
    {id:  11, numOfFractions: 3, dosePerFraction: 3.14, targetVolume: "PTV1"},
    {id:  22, numOfFractions: 3, dosePerFraction: 2.78, targetVolume: "PTV2"},
    {id:  33, numOfFractions: 3, dosePerFraction: 1.11, targetVolume: "PTV3"},
];

const refinedPrescription = [
    {id: 111, numOfFractions: 4, dosePerFraction: 3.14, targetVolume: "PTV1"},
    {id: 122, numOfFractions: 4, dosePerFraction: 2.78, targetVolume: "PTV2"},
    {id: 133, numOfFractions: 4, dosePerFraction: 1.11, targetVolume: "PTV3"},
];

const Intent = () => (
    <Container className="p-3">        
      <Prescription
        data={{
            items: initialPrescription,
            canEditDose: false
        }}
      />
      <div/>
      <Prescription
        data={{
            items: refinedPrescription,
            canEditDose: true
        }}
      />    
    </Container>    
  );


export {Intent};
