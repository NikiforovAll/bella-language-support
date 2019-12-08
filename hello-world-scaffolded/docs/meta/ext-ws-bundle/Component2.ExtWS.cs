using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.ServiceModel;
namespace DomainBellaNS.API {
    [DataContract]
    public enum DomainError {
        [EnumMember]
         DomainError = 1
    }
    namespace Component2 {
        [ServiceContract]
        public interface Component2 {
            [OperationContract]
            [FaultContractAttribute(typeof(DomainFault))]
             void ExampleMethod();
        }
    }
    namespace Echo1 {
        [ServiceContract]
        public interface Echo1 {
            [OperationContract]
            [FaultContractAttribute(typeof(DomainFault))]
             void DoEcho1();
        }
    }
    [DataContractAttribute]
    public class DomainFault {
        [DataMemberAttribute]
        public DomainError Code;
        [DataMemberAttribute]
        public string Message;
    }

}