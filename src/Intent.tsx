import { useState, useRef, useMemo } from "react";
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

        let foo;
        if (!source || !Array.isArray(source)) {
            foo = [];
        } else {
            foo = source;
        };

        return foo.map((item, idx) => {
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
    timestamp: Date;
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
            { console.log("Here I am, PrescriptionItem render.", data) }
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
                            value={"??"}
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

function useResetableList<S>(source: S[]) {

    const [isInitializing, setInitializing] = useState(true);
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

    useMemo(() => {
        if (isInitializing) {
            setInitializing(false);
        } else {
            setItems(source);
        }
    }, [isInitializing, source]);

    return { items, setItems, removeItem, addItem }
}

const Prescription = (props: PrescriptionProps) => {

    console.log("Prescription is going to call `useList`", props.data.items);
   
    const { items, setItems, removeItem, addItem } = useResetableList(props.data.items);

    /*
    const [isInitializing, setInitializing] = useState(true);
    const { items, setItems, removeItem, addItem } = useList(props.data.items);

    useMemo(() => {
        if (isInitializing) {
            setInitializing(false);
        } else {
            setItems(props.data.items);
        }
    }, [props.data.items]);
    */
    
    
    console.log("This is what `useList` thinks about state", items);

    const updateFractionNumber = (frNum: number) => {
        const newItems = items.map(item => ({...item, numOfFractions: frNum}));
        setItems(newItems);
    }

    const createKey = createKeyGen();

    return(
        <Container className="p-3">
        {console.log("Reporting to duty, rendering Prescription", items, props.data.items)}
            {/*
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
            */}
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
                    targetVolume: "",
                    timestamp: new Date()
                })}
            >
                More boost
            </Button>
        </Container>    
    );
}

const onStart = new Date();

const initialPrescription = [
    {id:  11, numOfFractions: 3, dosePerFraction: 3.14, targetVolume: "PTV1", timestamp: onStart},
    {id:  22, numOfFractions: 3, dosePerFraction: 2.78, targetVolume: "PTV2", timestamp: onStart},
    {id:  33, numOfFractions: 3, dosePerFraction: 1.11, targetVolume: "PTV3", timestamp: onStart},
];

const refinedPrescription = [
    {id: 111, numOfFractions: 4, dosePerFraction: 3.14, targetVolume: "PTV1", timestamp: onStart},
    {id: 122, numOfFractions: 4, dosePerFraction: 2.78, targetVolume: "PTV2", timestamp: onStart},
    {id: 133, numOfFractions: 4, dosePerFraction: 1.11, targetVolume: "PTV3", timestamp: onStart},
];

const Intent = () => {

    const [ p1, setP1 ] = useState(initialPrescription);
    const [ p2, setP2 ] = useState(refinedPrescription);

    return (    
    <Container className="p-3">
    { console.log("Inside Intent Render") }
      <Row>
        <Prescription
            data={{
                items: p1,
                canEditDose: false
            }}
        />
      </Row>
      <Row>      
        <Prescription
            data={{
                items: p2,
                canEditDose: true
            }}
        />
      </Row> 
      <Row>
          <Button
            onClick={e => {
                setP1([...initialPrescription]);
                setP2([...refinedPrescription]);
                console.log("Reset clicked", p1, p2);
            }}
          >
              Reset
          </Button>
      </Row>
    </Container>    
  );
}

export {Intent};
