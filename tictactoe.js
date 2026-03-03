let boxes =document.querySelectorAll(".box");
let reset_btn =document.querySelector("#reset");
document.querySelector(".winner").style.visibility="hidden"
let turno = true;//playero
let count=0;
const win_pattern=[
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
]
const pattern =[];
let idx=0;
 boxes.forEach((box)=>{
    box.addEventListener("click",()=>{
        if(turno===true){
            box.innerText="O";
            turno=false;
        }else{
            box.innerText="X";
            turno=true;
        }
        count++;
        box.disabled=true;
       let isWinner = check_winner();
       if (count === 9 && !isWinner) {
            gameTie();

            boxdisable();
        }
    })
    
})

const boxdisable=()=>{
    boxes.forEach((box)=>{
        box.disabled=true;
    })
}
const gameTie = () => {
    alert("Game was a Tie.");
    document.querySelector(".winner").innerText="Game was a Tie!"
    document.querySelector(".winner").style.visibility="visible";
};
const check_winner=()=>{
    for(let pattern of win_pattern){
       let pos1val = boxes[pattern[0]].innerText;
        let pos2val = boxes[pattern[1]].innerText;
         let pos3val = boxes[pattern[2]].innerText;
         if(pos1val!=="" && pos2val!=="" && pos3val!=="" ){
            if(pos1val===pos2val && pos3val===pos2val){
              alert(`Winner is player ${pos1val}`)
              boxdisable();
          document.querySelector(".winner").innerText=`Congratulation ! Winner is player ${pos1val}`
          document.querySelector(".winner").style.visibility="visible";
              return true;
            }
        
         }
    }
    return false;
}
// reset
let res = document.querySelector("#reset");
res.addEventListener("click",()=>{
    turno=true;
    count=0;
    for(let box of boxes){
        box.innerText="";
    }
    enable();
    document.querySelector(".winner").style.visibility="hidden";
});
//enable
const enable = ()=>{
    for(let box of boxes){
        box.disabled=false;
    }
}
