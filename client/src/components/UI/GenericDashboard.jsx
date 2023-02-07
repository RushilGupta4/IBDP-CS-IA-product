import React from 'react';
import Image from 'next/image'
import Link from 'next/link';
import Card from '../../components/UI/Card';


function Item({ img, text, to }) {
    return (
        <Link href={to}>
            <a className='justify-center items-center w-full flex flex-col py-2'>
                <span className="w-1/2 m-auto pb-1">
                    <Image
                        src={img}
                        width={100}
                        height={100}
                        layout={"responsive"}
                    />
                </span>
                <p className="m-auto text-center h-max">{text}</p>
            </a>
        </Link>
    )
};


function Dashboard({ items }) {
    return (
        <div className="flex flex-col items-center justify-center my-auto flex-grow">
            <Card className={"!w-3/5 grid grid-cols-1 md:grid-cols-3 justify-items-center gap-5 md:gap-10 !p-5 md:!p-14"}>
                {
                    items.map(item =>
                        <Item
                            text={item.name}
                            to={item.to}
                            img={item.img}
                            key={item.name + item.to}
                        />
                    )
                }
            </Card>
        </div>
    );
}

export default Dashboard;
