'use client';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { Card, Row, Col, FormCheck, Form, FormLabel, FormSelect, Button } from 'react-bootstrap';
import * as THREE from 'three';
import { useUrl } from '../compoent/UrlContext';
import { useMsg } from '../compoent/websocket';

interface ScanModeProps {
    toggleFeature: () => void;
    isPointAnimation: boolean;
    angle: string; 
    handleAngleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    isPaused: boolean;
    togglePause: () => void;
    rendererRef: React.MutableRefObject<THREE.WebGLRenderer | null>;
    sceneRef: React.MutableRefObject<THREE.Scene | null>;
    cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
}

const ScanCard: React.FC<ScanModeProps> = ({ toggleFeature, isPointAnimation, angle, handleAngleChange, isPaused, togglePause, rendererRef, sceneRef, cameraRef }) => {
    const { url } = useUrl();
    const { points, status, name, setPoints } = useMsg();
    const [projectName, setProjectName] = useState('');
    
    const saveSvg = () => {
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
            const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = '${projectName}.png';
            link.click();
        }
    };

    const saveCsv = () => {
        if (points && points.length > 0) {
            const csvContent = points.map(row => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.setAttribute('download', '${projectName}.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleStart = () => {
        if(projectName === "" || projectName === undefined) {return;};
        setPoints([])
        if(!url || url === "" || url === undefined || url.includes("github.io")) {return;};
        axios.get(`http://${url}/api/set/scanner?command=new&name=${projectName}`)
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handlePause = () => {
        if(!url || url === "" || url === undefined || url.includes("github.io")) {return;};
        axios.get(`http://${url}/api/set/scanner?command=stop`)
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleResume = () => {
        if(!url || url === "" || url === undefined || url.includes("github.io")) {return;};
        axios.get(`http://${url}/api/set/scanner?command=start`)
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleEnd = () => {
        if(!url || url === "" || url === undefined || url.includes("github.io")) {return;};
        axios.get(`http://${url}/api/set/scanner?command=end`)
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <Card bg="light" className='text-center d-flex flex-grow-1 my-5 mx-4'>
            <Card.Header className='fs-2 fw-bold'>3D立體成形掃描機</Card.Header>
            <Card.Body>
                <FormLabel className='fs-3 mt-4 fw-bold'>{name}</FormLabel>
                <Row>
                    <Col>
                        <Button onClick={saveSvg}>
                            下載圖片
                        </Button>
                    </Col>
                    <Col>
                        <Button onClick={saveCsv}>
                            下載CSV
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormLabel className='fw-bold fs-3 mt-4'>選擇角度</FormLabel>
                        <FormSelect value={angle} onChange={handleAngleChange}>
                            <option value="up">上</option>
                            <option value="down">下</option>
                            <option value="left">左</option>
                            <option value="right">右</option>
                            <option value="top-left">左上</option>
                            <option value="bottom-left">左下</option>
                            <option value="top-right">右上</option>
                            <option value="bottom-right">右下</option>
                            <option value="front">前</option>
                            <option value="back">後</option>
                        </FormSelect>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Button onClick={togglePause}  size="lg" className='mt-4'>
                            {isPaused ? '旋轉' : '停止旋轉'}
                        </Button>
                    </Col>
                </Row>
                    <Row>
                        <Col>
                        {status === "end" && (
                            <div>
                                <Form.Control 
                                    type='text' 
                                    placeholder='輸入專案名稱' 
                                    className='mt-4' 
                                    required
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                />
                                <Button className='mt-4'  size="lg" variant="success" onClick={handleStart}>
                                    開始
                                </Button>
                            </div>
                        )}
                        </Col>
                    </Row>
                    {(status === "scan" || status === "stop" ) && (
                        <>
                            <Row>
                                <Col>
                                { (status === "scan" ) ? (
                                    <Button className='mt-4' size="lg" variant="info" onClick={handlePause}>
                                        暫停
                                    </Button>
                                ) : (
                                    <Button className='mt-4' size="lg" onClick={handleResume} >
                                        繼續
                                    </Button>
                                )}
                                </Col>
                            </Row>     
                                            
                            <Row>
                                <Col>
                                    <Button className='mt-4' size="lg" variant="danger" onClick={handleEnd}>
                                        結束
                                    </Button>
                                </Col>
                            </Row>
                        </>
                    )}
            </Card.Body>
        </Card>
    )
}

export default ScanCard;