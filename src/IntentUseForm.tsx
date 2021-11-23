import { useRef, useReducer, useCallback, ChangeEvent, FocusEvent } from "react";
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
                            value={ (data.numOfFractions * data.dosePerFraction).toFixed(2) }
                        />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>
                        { !isBoost && <Form.Label>Target</Form.Label>}
                        <Form.Control
                            readOnly={!props.canEditDose}                                                        
                            defaultValue={data.targetVolume}
                            //FocusEvent<Target = Element, RelatedTarget = Element>
                            onBlur={ (e: FocusEvent<HTMLInputElement>) => props.onDataChange!({...data, targetVolume: e.target.value}) }
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

interface IntentModel {
    site: string;
    initialPrescription: PrescriptionItemModel[];
    refinedPrescription: PrescriptionItemModel[];
}

const initialPrescription: PrescriptionItemModel[] = [
    {id:  11, numOfFractions: 3, dosePerFraction: 3.14, targetVolume: "PTV1", timestamp: onStart},
    {id:  22, numOfFractions: 3, dosePerFraction: 2.78, targetVolume: "PTV2", timestamp: onStart},
    {id:  33, numOfFractions: 3, dosePerFraction: 1.11, targetVolume: "PTV3", timestamp: onStart},
];

const refinedPrescription = [
    {id: 111, numOfFractions: 4, dosePerFraction: 3.24, targetVolume: "PTV1", timestamp: onStart},
    {id: 122, numOfFractions: 4, dosePerFraction: 2.88, targetVolume: "PTV2", timestamp: onStart},
    {id: 133, numOfFractions: 4, dosePerFraction: 1.21, targetVolume: "PTV3", timestamp: onStart},
];


type Processor<T> = <P>(target: T, value: P) => void;

type Processor2<T, P> = (target: T, value: P) => void;

type Payload<T> = {
    e?: ChangeEvent<HTMLInputElement>;
    processString?: (target: T, value: string) => void;
    processNumber?: (target: T, value: number) => void;
    raw?: any;
    processRaw?: (target: T, value: any) => void;
    // TODO add other processors

    resetValue?: T
  };



function useForm<T>(initData: T) {

    const reduce = (current: T, payload: Payload<T>) => {

        if (payload.resetValue) {
            return payload.resetValue;
        }

        const shallowCopy = { ...current };
        
        if (payload.processString) { payload.processString(shallowCopy, payload.e!.target.value); }
        else if (payload.processNumber) { payload.processNumber(shallowCopy, Number(payload.e!.target.value)); }
        else if (payload.processRaw) { payload.processRaw(shallowCopy, payload.raw)}
    
        console.log("After processing", shallowCopy);
        return shallowCopy;
    }

    const reset = (newValue: T) => {
        dispatch({resetValue: newValue});
    };

    const [current, dispatch] = useReducer(reduce, initData);

    const wrapStringProcessor = useCallback((process: Processor<T>) => {
        return (e: ChangeEvent<HTMLInputElement>) => dispatch({ e, processString: process });
    }, [dispatch]);
    
    const wrapNumberProcessor = useCallback((process: Processor<T>) => {
        return (e: ChangeEvent<HTMLInputElement>) => dispatch({ e, processNumber: process });
    }, [dispatch]);

    function foobar<PPP>(process: Processor2<T, PPP>) {
        return (r: PPP) => dispatch({ raw: r, processRaw: process });
    };
    
    return {
        current,
        str: wrapStringProcessor,
        num: wrapNumberProcessor,
        raw: foobar,
        reset
    };
}

const Intent = () => {

    const intentModel: IntentModel = {
        site: "Pelvis",
        initialPrescription: initialPrescription,
        refinedPrescription: refinedPrescription
    }

    const { current: model, str, num, raw, reset } = useForm(intentModel);

    return (    
    <Container className="p-3">
    { console.log("Inside Intent Render") }
      <Row>
        <Prescription
            data={{
                items: model.initialPrescription,
                canEditDose: false
            }}
            //onDataChanged={ newP => setP1(newP) }
            onDataChanged={ xx => {
                console.log("onDataChanged xx", xx);
                const foo = raw<PrescriptionItemModel[]>((c, newP) => {
                    console.log("newP", newP);
                    c.initialPrescription = newP;
                });

                foo(xx);
            } }
        />
      </Row>
      <Row>      
        <Prescription
            data={{
                items: model.refinedPrescription,
                canEditDose: true
            }}
            //onDataChanged={ newP => setP2(newP) }
            onDataChanged={ xx => {
                console.log("onDataChanged xx", xx);
                const foo = raw<PrescriptionItemModel[]>((c, newP) => {
                    console.log("newP", newP);
                    c.refinedPrescription = newP;
                });

                foo(xx);
            } }
        />
      </Row> 
      <Row>
          <Button className={"m-1"}
            onClick={ _ => reset(intentModel) }
          >
              Reset
          </Button>
          <Button className={"m-1"}
            onClick={e => {

                console.log("Saving...", model);

                const newTimestamp = new Date();
                const newModel: IntentModel = {
                    site: model.site,
                    initialPrescription: model.initialPrescription.map(p => ({ ...p, timestamp: newTimestamp})),
                    refinedPrescription: model.refinedPrescription.map(p => ({ ...p, timestamp: newTimestamp}))
                }
                console.log("New state...", newModel);

                reset(newModel);
            }}
          >
              Save
          </Button>
      </Row>
    </Container>    
  );
}

export {Intent};
