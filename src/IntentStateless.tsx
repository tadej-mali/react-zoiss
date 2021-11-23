import { useState, useRef } from "react";
import { Container, Form, Row, Col, Button } from "react-bootstrap";

function replace<T>(source: T[], oldItem: T, newItem: T) {
    return source.map(item => item === oldItem ? newItem : item);
}

function put<T>(source: T[], idx: number, newItem: T) {
    return source.map((item, i) => i === idx ? newItem : item);
}

function remove<T>(source: T[], idx: number) {
    return source.filter((_, i) => i !== idx);
}

function add<T>(source: T[], newItem: T) {
    return [...source, newItem];
};


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
    timestamp: Date;
}

interface PrescriptionItemProps {
    theKey: string
    data: PrescriptionItemModel
    onDataChange?: (newValue: PrescriptionItemModel) => void
    onFractionsChange?: (frNum: number) => void
    isBoost?: boolean
    canEditDose: boolean
    canDelete: boolean
    onDelete?: () => void
};

const PrescriptionItem = (props: PrescriptionItemProps) => {

    const { data, isBoost } = props;
    
    const btnRef = useRef<HTMLButtonElement>(null);
    const [dosePerFrac, setDosePerFrac] = useState<number>(data.dosePerFraction);

    const dataProps = props.isBoost
        ? { value: data.numOfFractions }
        : { value: data.numOfFractions };

    return (
        <Container>
            { console.log("Here I am, PrescriptionItem render.", props) }
            <Row className="align-items-end">
                <Col>
                    <Form.Group>
                        { !isBoost && <Form.Label>Num Frac</Form.Label> }
                        <Form.Control
                            { ... dataProps }
                            readOnly={isBoost}
                            plaintext={isBoost}
                            style={{textAlign: 'right'}}
                            onChange={ e => props.onFractionsChange!(Number(e.target.value)) }
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
                            value={data.dosePerFraction}
                            style={{textAlign: 'right'}}
                            onChange={ e => {
                                props.onDataChange!({...data, dosePerFraction: Number(e.target.value)})
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
                            onChange={ e => props.onDataChange!({...data, targetVolume: e.target.value}) }
                        />
                    </Form.Group>
                </Col>
                <Col>
                <Form.Group>
                    { !isBoost && <Form.Label>Timestamp</Form.Label>}
                        <Form.Control
                            readOnly
                            plaintext
                            style={{textAlign: 'right'}}
                            value={data.timestamp.toTimeString()}
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
    onDataChanged: (newValue: PrescriptionItemModel[]) => void
};


const Prescription = (props: PrescriptionProps) => {

    const data = props.data;

    const updateNumOfFractions = (frNum: number) => {
        return data.items.map(item => ({...item, numOfFractions: frNum}));
    }

    return(
        <Container className="p-3">
        {console.log("Reporting to duty, rendering Prescription", data.items)}
            {withKeyGen(data.items)((item, idx, generateKey) => {
                const theKey = generateKey(item.id, idx); 
                return (
                    <PrescriptionItem
                        key={theKey}
                        theKey={theKey}
                        data={item}
                        isBoost={idx > 0}
                        canDelete={idx > 0}
                        canEditDose={data.canEditDose}
                        //onDataChange={newData => props.onDataChanged(replace(data.items, item, newData))}
                        onDataChange={newData => props.onDataChanged(put(data.items, idx, newData))}
                        onFractionsChange={(frNum) => props.onDataChanged(updateNumOfFractions(frNum)) }
                        // if needed, this can be delegated to parent
                        onDelete={ () => props.onDataChanged(remove(data.items, idx)) }                        
                    />)
            })}
            
            <Button
                onClick={ _ => props.onDataChanged(add(
                    data.items,
                    {
                        id: 0,
                        numOfFractions: data.items[0].numOfFractions,
                        dosePerFraction: 0,
                        targetVolume: "",
                        timestamp: new Date()
                    }))
                }
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
    {id: 111, numOfFractions: 4, dosePerFraction: 3.24, targetVolume: "PTV1", timestamp: onStart},
    {id: 122, numOfFractions: 4, dosePerFraction: 2.88, targetVolume: "PTV2", timestamp: onStart},
    {id: 133, numOfFractions: 4, dosePerFraction: 1.21, targetVolume: "PTV3", timestamp: onStart},
];

const Intent = () => {

    const [ p1, setP1 ] = useState<PrescriptionItemModel[]>(initialPrescription);
    const [ p2, setP2 ] = useState<PrescriptionItemModel[]>(refinedPrescription);

    return (    
    <Container className="p-3">
    { console.log("Inside Intent Render") }
      <Row>
        <Prescription
            data={{
                items: p1,
                canEditDose: false
            }}
            onDataChanged={ newP => setP1(newP) }
        />
      </Row>
      <Row>      
        <Prescription
            data={{
                items: p2,
                canEditDose: true
            }}
            onDataChanged={ newP => setP2(newP) }
        />
      </Row> 
      <Row>
          <Button className={"m-1"}
            onClick={e => {
                setP1([...initialPrescription]);
                setP2([...refinedPrescription]);
                console.log("Reset clicked", p1, p2);
            }}
          >
              Reset
          </Button>
          <Button className={"m-1"}
            onClick={e => {

                console.log("Saving...", p1, p2)

                const newTimestamp = new Date();
                const newP1 = initialPrescription.map(p => ({ ...p, timestamp: newTimestamp}))
                const newP2 = refinedPrescription.map(p => ({ ...p, timestamp: newTimestamp}))
                
                setP1(newP1);
                setP2(newP2);

                console.log("New time...", newTimestamp)
                console.log("New state...", newP1, newP2)
            }}
          >
              Save
          </Button>
      </Row>
    </Container>    
  );
}

export {Intent};
